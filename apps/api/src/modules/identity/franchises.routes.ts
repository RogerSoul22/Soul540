import { Router } from 'express';
import { getTenantFilter, getTenantUnit } from '../../infrastructure/middleware/tenant';
import { requireGlobalAdmin, requirePermission } from '../../infrastructure/middleware/permissions';
import {
  ensureUniqueFranchiseSlug,
  FranchiseModel,
  getActiveFranchiseOrThrow,
  normalizeFranchiseSlug,
} from './franchise-policy';

const router = Router();

router.get('/', requirePermission('franquias', 'read'), async (req, res) => {
  const franchises = await FranchiseModel.find({ ...getTenantFilter(req), deletedAt: { $exists: false } }).sort({
    createdAt: -1,
  });
  res.json(franchises);
});

router.get('/slug/:slug', async (req, res) => {
  const franchise = await FranchiseModel.findOne({ slug: req.params.slug, deletedAt: { $exists: false } });
  if (!franchise || !['ativa', 'em_implantacao', 'congelada'].includes(franchise.status)) {
    return res.status(404).json({ error: 'Franchise not found or inactive' });
  }
  const user = (req as any).user;
  if (user?.unit === 'franchise' && user.franchiseId?.toString() !== franchise.id) {
    return res.status(404).json({ error: 'Franchise not found' });
  }
  res.json(franchise);
});

router.post('/', requireGlobalAdmin, async (req, res) => {
  const slug = normalizeFranchiseSlug(req.body.name || '');
  await ensureUniqueFranchiseSlug(slug);
  const { name, owner, city, state, monthlyFee, status, openDate } = req.body;
  try {
    const franchise = await FranchiseModel.create({
      name,
      slug,
      owner,
      city,
      state,
      monthlyFee,
      status,
      openDate,
      unit: 'main',
    });
    res.status(201).json(franchise);
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Franchise slug already exists' });
    throw err;
  }
});

router.put('/:id', requireGlobalAdmin, async (req, res) => {
  const franchise = await FranchiseModel.findById(req.params.id);
  if (!franchise) return res.status(404).json({ error: 'Not found' });
  if (!(req as any).user?.isAdmin && franchise.unit !== getTenantUnit(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const update = { ...req.body };
  delete update.unit;
  if (update.name) update.slug = normalizeFranchiseSlug(update.name);
  if (update.slug) await ensureUniqueFranchiseSlug(update.slug, req.params.id);
  const updated = await FranchiseModel.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(updated);
});

router.delete('/:id', requireGlobalAdmin, async (req, res) => {
  const franchise = await getActiveFranchiseOrThrow(req.params.id);
  if (!franchise) return res.status(404).json({ error: 'Not found' });
  if (!(req as any).user?.isAdmin && franchise.unit !== getTenantUnit(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  await FranchiseModel.findByIdAndUpdate(req.params.id, {
    $set: { status: 'encerrada', deletedAt: new Date() },
  });
  res.status(204).end();
});

export default router;
