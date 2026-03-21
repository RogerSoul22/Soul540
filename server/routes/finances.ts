import { Router } from 'express';
import mongoose from 'mongoose';
import { getTenantFilter, getTenantUnit } from '../middleware/tenant';

const FinanceSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: '' },
    type: { type: String, enum: ['revenue', 'cost'], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'received'], default: 'pending' },
    autoEventBudget: { type: Boolean, default: false },
    unit: { type: String, default: 'main' },
  },
  { toJSON: { virtuals: true, versionKey: false }, id: true },
);

export const Finance = mongoose.models.Finance || mongoose.model('Finance', FinanceSchema);
const router = Router();

router.get('/', async (req, res) => {
  const finances = await Finance.find(getTenantFilter(req)).sort({ date: -1 });
  res.json(finances);
});

router.post('/', async (req, res) => {
  const finance = await Finance.create({ ...req.body, unit: getTenantUnit(req) });
  res.status(201).json(finance);
});

router.put('/:id', async (req, res) => {
  const finance = await Finance.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!finance) return res.status(404).json({ error: 'Not found' });
  res.json(finance);
});

router.delete('/:id', async (req, res) => {
  await Finance.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
