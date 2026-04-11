import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';
import { logAudit } from '../utils/audit';

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
  source: { type: String, default: 'main' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { collection: 'invoices', toJSON: { virtuals: true, versionKey: false } });

const FranchiseInvoiceSchema = new Schema({
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
  source: { type: String, default: 'franchise' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { collection: 'franchiseinvoices', toJSON: { virtuals: true, versionKey: false } });

const FactoryInvoiceSchema = new Schema({
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
  source: { type: String, default: 'factory' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { collection: 'factoryinvoices', toJSON: { virtuals: true, versionKey: false } });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
const FranchiseInvoice = mongoose.models.FranchiseInvoice || mongoose.model('FranchiseInvoice', FranchiseInvoiceSchema);
const FactoryInvoice = mongoose.models.FactoryInvoice || mongoose.model('FactoryInvoice', FactoryInvoiceSchema);

function isFromFranchise(req: any): boolean {
  return getTenantUnit(req) === 'franchise';
}

function isFromFactory(req: any): boolean {
  return getTenantUnit(req) === 'factory';
}

async function findInAllCollections(id: string) {
  const doc = await Invoice.findById(id);
  if (doc) return { doc, model: Invoice };
  const fdoc = await FranchiseInvoice.findById(id);
  if (fdoc) return { doc: fdoc, model: FranchiseInvoice };
  const factDoc = await FactoryInvoice.findById(id);
  if (factDoc) return { doc: factDoc, model: FactoryInvoice };
  return null;
}

const router = Router();

router.get('/', async (req, res) => {
  if (isFromFactory(req)) {
    const items = await FactoryInvoice.find({});
    return res.json(items);
  }
  const Model = isFromFranchise(req) ? FranchiseInvoice : Invoice;
  const items = await Model.find({});
  res.json(items);
});

router.post('/', async (req, res) => {
  if (isFromFactory(req)) {
    const invoice = await FactoryInvoice.create({ ...req.body, source: 'factory' });
    await logAudit({ req, action: 'create', resource: 'invoices', resourceId: invoice.id, description: `Criou nota fiscal: ${invoice.clientName} (R$ ${invoice.totalValue})` });
    return res.status(201).json(invoice);
  }
  if (isFromFranchise(req)) {
    const invoice = await FranchiseInvoice.create({ ...req.body, source: 'franchise' });
    await logAudit({ req, action: 'create', resource: 'invoices', resourceId: invoice.id, description: `Criou nota fiscal: ${invoice.clientName} (R$ ${invoice.totalValue})` });
    return res.status(201).json(invoice);
  }
  const invoice = await Invoice.create({ ...req.body, source: 'main' });
  await logAudit({ req, action: 'create', resource: 'invoices', resourceId: invoice.id, description: `Criou nota fiscal: ${invoice.clientName} (R$ ${invoice.totalValue})` });
  res.status(201).json(invoice);
});

router.put('/:id', async (req, res) => {
  const found = await findInAllCollections(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const invoice = await found.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logAudit({ req, action: 'update', resource: 'invoices', resourceId: req.params.id, description: `Atualizou nota fiscal: ${invoice?.clientName}` });
  res.json(invoice);
});

router.delete('/:id', async (req, res) => {
  const found = await findInAllCollections(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const clientName = found.doc?.clientName || req.params.id;
  await found.model.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'invoices', resourceId: req.params.id, description: `Excluiu nota fiscal: ${clientName}` });
  res.status(204).end();
});

export default router;
