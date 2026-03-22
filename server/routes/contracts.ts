import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantFilter, getTenantUnit } from '../middleware/tenant';

const ContractSchema = new Schema({
  clientName: String,
  clientDocument: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  eventId: { type: String, default: '' },
  value: { type: Number, default: 0 },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
  paymentConditions: { type: String, default: '' },
  terms: { type: String, default: '' },
  status: { type: String, default: 'rascunho' },
  unit: { type: String, default: 'main' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { toJSON: { virtuals: true, versionKey: false } });

const Contract = mongoose.models.Contract || mongoose.model('Contract', ContractSchema);

const router = Router();

router.get('/', async (req, res) => {
  const contracts = await Contract.find(getTenantFilter(req)).sort({ createdAt: -1 });
  res.json(contracts);
});

router.post('/', async (req, res) => {
  const contract = await Contract.create({ ...req.body, unit: getTenantUnit(req) });
  res.status(201).json(contract);
});

router.put('/:id', async (req, res) => {
  const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!contract) return res.status(404).json({ error: 'Not found' });
  res.json(contract);
});

router.delete('/:id', async (req, res) => {
  await Contract.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
