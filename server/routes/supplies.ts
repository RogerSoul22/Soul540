import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantFilter, getTenantUnit } from '../middleware/tenant';

const SupplySchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, default: '' },
  measureUnit: { type: String, default: 'kg' },
  quantity: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  expirationDate: String,
  status: { type: String, default: 'em_estoque' },
  unit: { type: String, default: 'main' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { toJSON: { virtuals: true, versionKey: false } });

const Supply = mongoose.models.Supply || mongoose.model('Supply', SupplySchema);

const router = Router();

router.get('/', async (req, res) => {
  const supplies = await Supply.find(getTenantFilter(req)).sort({ name: 1 });
  res.json(supplies);
});

router.post('/', async (req, res) => {
  const supply = await Supply.create({ ...req.body, unit: getTenantUnit(req) });
  res.status(201).json(supply);
});

router.put('/:id', async (req, res) => {
  const supply = await Supply.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!supply) return res.status(404).json({ error: 'Not found' });
  res.json(supply);
});

router.delete('/:id', async (req, res) => {
  await Supply.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
