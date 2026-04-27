import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from './auth';
import { getTenantUnit } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../schemas/users';
import { logAudit } from '../utils/audit';

const router = Router();

// GET /api/users
router.get('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const query = (unit && unit !== 'main') ? { $or: [{ unit }, { isAdmin: true }] } : {};
  const users = await UserModel.find(query).select('-passwordHash');
  res.json(users);
});

// POST /api/users
router.post('/', validate(createUserSchema), async (req, res) => {
  const { name, email, password, isAdmin, permissions, unit: bodyUnit } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await UserModel.create({ name, email: email.toLowerCase().trim(), passwordHash, passwordPlain: password, isAdmin, permissions, unit: bodyUnit || getTenantUnit(req) });
    const { passwordHash: _, ...safe } = user.toJSON();
    await logAudit({ req, action: 'create', resource: 'users', resourceId: user.id, description: `Criou usuário: ${name} (${email})` });
    res.status(201).json(safe);
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email já cadastrado' });
    throw err;
  }
});

// PUT /api/users/:id
router.put('/:id', validate(updateUserSchema), async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'not found' });
  if ((req as any).user?.role !== 'admin' && user.unit !== getTenantUnit(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const { name, isAdmin, permissions, password } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (isAdmin !== undefined) update.isAdmin = isAdmin;
  if (permissions !== undefined) update.permissions = permissions;
  if (password) {
    update.passwordHash = await bcrypt.hash(password, 10);
    update.passwordPlain = password;
  }
  const updated = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
  const desc = password ? `Alterou senha do usuário: ${user.name}` : `Atualizou usuário: ${user.name}`;
  await logAudit({ req, action: 'update', resource: 'users', resourceId: req.params.id, description: desc });
  res.json(updated);
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'not found' });
  if ((req as any).user?.role !== 'admin' && user.unit !== getTenantUnit(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  await UserModel.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'users', resourceId: req.params.id, description: `Excluiu usuário: ${user.name} (${user.email})` });
  res.status(204).end();
});

export default router;
