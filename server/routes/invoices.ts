import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantFilter, getTenantUnit } from '../middleware/tenant';

const InvoiceItemSchema = new Schema({
  description: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
}, { _id: false });

const InvoiceSchema = new Schema({
  eventId: { type: String, default: '' },
  clientName: { type: String, default: '' },
  clientDocument: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  issueDate: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, default: 'rascunho' },
  unit: { type: String, default: 'main' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { toJSON: { virtuals: true, versionKey: false } });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

const router = Router();

router.get('/', async (req, res) => {
  const invoices = await Invoice.find(getTenantFilter(req)).sort({ createdAt: -1 });
  res.json(invoices);
});

router.post('/', async (req, res) => {
  const invoice = await Invoice.create({ ...req.body, unit: getTenantUnit(req) });
  res.status(201).json(invoice);
});

router.put('/:id', async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  res.json(invoice);
});

router.delete('/:id', async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
