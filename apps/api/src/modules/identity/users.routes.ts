import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from './auth.routes';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import { validate } from '../../infrastructure/middleware/validate';
import { createUserSchema, updateUserSchema } from '../../infrastructure/schemas/users';
import { logAudit } from '../../infrastructure/audit-log';
import { requireAdmin } from '../../infrastructure/middleware/auth';
import { requireFranchiseId } from '../../infrastructure/franchise-context';
import { assertFranchiseUserLink, getActiveFranchiseOrThrow } from './franchise-policy';
import { rememberPassword } from './password-vault-store';

const router = Router();

router.use(requireAdmin);

// GET /api/users
router.get('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const query =
    unit === 'franchise'
      ? { $or: [{ unit, franchiseId: requireFranchiseId(req) }, { isAdmin: true }] }
      : unit && unit !== 'main'
        ? { $or: [{ unit }, { isAdmin: true }] }
        : {};
  const users = await UserModel.find({ ...query, deletedAt: { $exists: false } }).select(
    '-passwordHash -passwordPlain',
  );
  res.json(users);
});

// POST /api/users
router.post('/', validate(createUserSchema), async (req, res) => {
  const { name, email, password, isAdmin, permissions, unit: bodyUnit, franchiseId } = req.body;
  const targetUnit = bodyUnit || getTenantUnit(req);
  const contextUnit = getTenantUnit(req);
  const targetFranchiseId = contextUnit === 'franchise' ? requireFranchiseId(req) : franchiseId;
  if (contextUnit === 'franchise' && targetUnit !== 'franchise') {
    return res.status(403).json({ error: 'Cannot create a user outside this franchise' });
  }
  if (contextUnit === 'factory' && targetUnit !== 'factory') {
    return res.status(403).json({ error: 'Cannot create a user outside the factory' });
  }
  try {
    assertFranchiseUserLink(targetUnit, targetFranchiseId);
    if (targetUnit === 'franchise') await getActiveFranchiseOrThrow(targetFranchiseId);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await UserModel.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      isAdmin,
      permissions,
      unit: targetUnit,
      ...(targetFranchiseId && { franchiseId: targetFranchiseId }),
    });
    await rememberPassword(user._id, password);
    const { passwordHash: _, passwordPlain: __, ...safe } = user.toJSON();
    await logAudit({
      req,
      action: 'create',
      resource: 'users',
      resourceId: user.id,
      description: `Criou usuário: ${name} (${email})`,
    });
    res.status(201).json(safe);
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email já cadastrado' });
    throw err;
  }
});

// PUT /api/users/:id
router.put('/:id', validate(updateUserSchema), async (req, res) => {
  const user = await UserModel.findOne({ _id: req.params.id, deletedAt: { $exists: false } });
  if (!user) return res.status(404).json({ error: 'not found' });
  const { name, isAdmin, permissions, password, unit, franchiseId } = req.body;
  // A própria senha só troca informando a atual (POST /api/account/password); aqui é só a de outras pessoas.
  if (password && String(user._id) === String((req as any).user?._id)) {
    return res.status(400).json({ error: 'Para trocar a sua senha, informe a senha atual em Minha conta.' });
  }
  const targetUnit = unit || user.unit;
  const targetFranchiseId =
    getTenantUnit(req) === 'franchise' ? requireFranchiseId(req) : franchiseId || user.franchiseId?.toString();
  const movingOutsideScope = targetUnit !== 'franchise' || user.franchiseId?.toString() !== targetFranchiseId;
  if (getTenantUnit(req) === 'franchise' && movingOutsideScope) {
    return res.status(403).json({ error: 'Cannot move a user outside this franchise' });
  }
  if (getTenantUnit(req) === 'factory' && (targetUnit !== 'factory' || user.unit !== 'factory')) {
    return res.status(403).json({ error: 'Cannot move a user outside the factory' });
  }
  try {
    assertFranchiseUserLink(targetUnit, targetFranchiseId);
    if (targetUnit === 'franchise') await getActiveFranchiseOrThrow(targetFranchiseId);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (isAdmin !== undefined) update.isAdmin = isAdmin;
  if (unit !== undefined) update.unit = targetUnit;
  if (targetFranchiseId) update.franchiseId = targetFranchiseId;
  else update.$unset = { franchiseId: 1 };
  if (permissions !== undefined) update.permissions = permissions;
  if (password) {
    update.passwordHash = await bcrypt.hash(password, 10);
  }
  if (password) await rememberPassword(req.params.id, password);
  const updated = await UserModel.findOneAndUpdate({ _id: req.params.id, deletedAt: { $exists: false } }, update, {
    new: true,
  }).select('-passwordHash -passwordPlain');
  const desc = password ? `Alterou senha do usuário: ${user.name}` : `Atualizou usuário: ${user.name}`;
  await logAudit({ req, action: 'update', resource: 'users', resourceId: req.params.id, description: desc });
  res.json(updated);
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  const tenantUnit = getTenantUnit(req);
  if (tenantUnit === 'franchise' || tenantUnit === 'factory') {
    return res.status(403).json({ error: 'User deletion is disabled for this system' });
  }
  const deleteFilter =
    getTenantUnit(req) === 'franchise'
      ? { _id: req.params.id, unit: 'franchise', franchiseId: requireFranchiseId(req) }
      : { _id: req.params.id };
  const user = await UserModel.findOne(deleteFilter);
  if (!user) return res.status(404).json({ error: 'not found' });
  await UserModel.updateOne(deleteFilter, { $set: { deletedAt: new Date() } });
  await logAudit({
    req,
    action: 'delete',
    resource: 'users',
    resourceId: req.params.id,
    description: `Excluiu usuário: ${user.name} (${user.email})`,
  });
  res.status(204).end();
});

export default router;
