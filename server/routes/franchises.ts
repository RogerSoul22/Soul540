import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantFilter, getTenantUnit } from '../middleware/tenant';

const FranchiseSchema = new Schema({
  name: String,
  owner: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: 'SP' },
  monthlyFee: { type: Number, default: 0 },
  status: { type: String, default: 'em_implantacao' },
  openDate: { type: String, default: '' },
  unit: { type: String, default: 'main' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { toJSON: { virtuals: true, versionKey: false } });

const Franchise = mongoose.models.Franchise || mongoose.model('Franchise', FranchiseSchema);

const router = Router();

router.get('/', async (req, res) => {
  const franchises = await Franchise.find(getTenantFilter(req)).sort({ createdAt: -1 });
  res.json(franchises);
});

router.post('/', async (req, res) => {
  const franchise = await Franchise.create({ ...req.body, unit: getTenantUnit(req) });
  res.status(201).json(franchise);
});

router.put('/:id', async (req, res) => {
  const franchise = await Franchise.findById(req.params.id);
  if (!franchise) return res.status(404).json({ error: 'Not found' });
  if ((req as any).user?.role !== 'admin' && franchise.unit !== getTenantUnit(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const updated = await Franchise.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const franchise = await Franchise.findById(req.params.id);
  if (!franchise) return res.status(404).json({ error: 'Not found' });
  if ((req as any).user?.role !== 'admin' && franchise.unit !== getTenantUnit(req)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  await Franchise.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
