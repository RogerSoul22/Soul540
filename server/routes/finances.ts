import { Router } from 'express';
import mongoose from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { createFinanceSchema, updateFinanceSchema } from '../schemas/finances';
import { logAudit } from '../utils/audit';

const FinanceSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: '' },
    type: { type: String, enum: ['revenue', 'cost'], required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'received'], default: 'pending' },
    autoEventBudget: { type: Boolean, default: false },
    origin: { type: String, enum: ['event', 'manual', 'factory_order', 'bank_import'], default: 'manual' },
    kind: { type: String, enum: ['balance', 'deposit', 'travel', 'commission', 'expense', 'manual'], default: 'manual' },
    employeeId: String,
    paymentMethod: String,
    dueDate: String,
    settledAt: String,
    settlementStatus: { type: String, enum: ['open', 'partial', 'settled', 'cancelled'], default: 'open' },
    automatic: { type: Boolean, default: false },
    reversedAt: String,
    reversedBy: String,
    reversalReason: String,
    source: { type: String, default: 'main' },
    installmentGroupId: { type: String },
    installmentNumber: { type: Number },
    installmentTotal: { type: Number },
    recurrenceId: { type: String },
    recurrenceFrequency: { type: String, enum: ['monthly', 'weekly', 'yearly'] },
    recurrenceEndDate: { type: String },
    externalId: String,
    importBatchId: String,
    bankAccount: String,
    bankStatementBalance: Number,
  },
  { collection: 'finances', toJSON: { virtuals: true, versionKey: false }, id: true },
);

const FranchiseFinanceSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: '' },
    type: { type: String, enum: ['revenue', 'cost'], required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'received'], default: 'pending' },
    autoEventBudget: { type: Boolean, default: false },
    origin: { type: String, enum: ['event', 'manual', 'factory_order', 'bank_import'], default: 'manual' },
    kind: { type: String, enum: ['balance', 'deposit', 'travel', 'commission', 'expense', 'manual'], default: 'manual' },
    employeeId: String,
    paymentMethod: String,
    dueDate: String,
    settledAt: String,
    settlementStatus: { type: String, enum: ['open', 'partial', 'settled', 'cancelled'], default: 'open' },
    automatic: { type: Boolean, default: false },
    reversedAt: String,
    reversedBy: String,
    reversalReason: String,
    source: { type: String, default: 'franchise' },
    installmentGroupId: { type: String },
    installmentNumber: { type: Number },
    installmentTotal: { type: Number },
    recurrenceId: { type: String },
    recurrenceFrequency: { type: String, enum: ['monthly', 'weekly', 'yearly'] },
    recurrenceEndDate: { type: String },
    externalId: String,
    importBatchId: String,
    bankAccount: String,
    bankStatementBalance: Number,
  },
  { collection: 'franchisefinances', toJSON: { virtuals: true, versionKey: false }, id: true },
);

const FactoryFinanceSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: '' },
    type: { type: String, enum: ['revenue', 'cost'], required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'received'], default: 'pending' },
    autoEventBudget: { type: Boolean, default: false },
    origin: { type: String, enum: ['event', 'manual', 'factory_order', 'bank_import'], default: 'manual' },
    kind: { type: String, enum: ['balance', 'deposit', 'travel', 'commission', 'expense', 'manual'], default: 'manual' },
    employeeId: String,
    paymentMethod: String,
    dueDate: String,
    settledAt: String,
    settlementStatus: { type: String, enum: ['open', 'partial', 'settled', 'cancelled'], default: 'open' },
    automatic: { type: Boolean, default: false },
    reversedAt: String,
    reversedBy: String,
    reversalReason: String,
    source: { type: String, default: 'factory' },
    installmentGroupId: { type: String },
    installmentNumber: { type: Number },
    installmentTotal: { type: Number },
    recurrenceId: { type: String },
    recurrenceFrequency: { type: String, enum: ['monthly', 'weekly', 'yearly'] },
    recurrenceEndDate: { type: String },
    externalId: String,
    importBatchId: String,
    bankAccount: String,
    bankStatementBalance: Number,
  },
  { collection: 'factoryfinances', toJSON: { virtuals: true, versionKey: false }, id: true },
);

FinanceSchema.index({ source: 1, date: -1 });
FinanceSchema.index({ eventId: 1 });
FinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });
FranchiseFinanceSchema.index({ source: 1, date: -1 });
FranchiseFinanceSchema.index({ eventId: 1 });
FranchiseFinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FranchiseFinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });
FactoryFinanceSchema.index({ source: 1, date: -1 });
FactoryFinanceSchema.index({ eventId: 1 });
FactoryFinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FactoryFinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });

export const Finance = mongoose.models.Finance || mongoose.model('Finance', FinanceSchema);
export const FranchiseFinance = mongoose.models.FranchiseFinance || mongoose.model('FranchiseFinance', FranchiseFinanceSchema);
export const FactoryFinance = mongoose.models.FactoryFinance || mongoose.model('FactoryFinance', FactoryFinanceSchema);

function isFromFranchise(req: any): boolean { return getTenantUnit(req) === 'franchise'; }
function isFromFactory(req: any): boolean { return getTenantUnit(req) === 'factory'; }

async function findFinanceInBothCollections(id: string) {
  const doc = await Finance.findById(id);
  if (doc) return { doc, model: Finance };
  const fdoc = await FranchiseFinance.findById(id);
  if (fdoc) return { doc: fdoc, model: FranchiseFinance };
  const factDoc = await FactoryFinance.findById(id);
  if (factDoc) return { doc: factDoc, model: FactoryFinance };
  return null;
}

const router = Router();

router.get('/', async (req, res) => {
  if (isFromFactory(req)) {
    const items = await FactoryFinance.find({ source: 'factory', reversedAt: { $exists: false } }).sort({ date: -1 });
    return res.json(items);
  }
  if (isFromFranchise(req)) {
    const items = await FranchiseFinance.find({ source: 'franchise', reversedAt: { $exists: false } }).sort({ date: -1 });
    return res.json(items);
  }
  const items = await Finance.find({ source: 'main', reversedAt: { $exists: false } }).sort({ date: -1 });
  res.json(items);
});

router.get('/summary', async (req, res) => {
  const scope = String(req.query.scope || getTenantUnit(req));
  const models = scope === 'combined'
    ? [Finance, FranchiseFinance, FactoryFinance]
    : scope === 'franchise'
      ? [FranchiseFinance]
      : scope === 'factory'
        ? [FactoryFinance]
        : [Finance];
  const start = typeof req.query.start === 'string' ? req.query.start : '';
  const end = typeof req.query.end === 'string' ? req.query.end : '';
  const date = start || end ? { ...(start ? { $gte: start } : {}), ...(end ? { $lte: end } : {}) } : undefined;
  const query = { reversedAt: { $exists: false }, ...(date ? { date } : {}) };
  const groups = await Promise.all(models.map((model) => model.find(query).lean()));
  const entries = groups.flat() as any[];
  const isSettled = (entry: any) => entry.settlementStatus === 'settled' || entry.status === 'received' || entry.status === 'paid';
  const active = entries.filter((entry) => entry.settlementStatus !== 'cancelled');
  const revenues = active.filter((entry) => entry.type === 'revenue');
  const costs = active.filter((entry) => entry.type === 'cost');
  const realizedIncome = revenues.filter(isSettled).reduce((sum, entry) => sum + entry.amount, 0);
  const projectedIncome = revenues.filter((entry) => !isSettled(entry)).reduce((sum, entry) => sum + entry.amount, 0);
  const realizedExpense = costs.filter(isSettled).reduce((sum, entry) => sum + entry.amount, 0);
  const projectedExpense = costs.filter((entry) => !isSettled(entry)).reduce((sum, entry) => sum + entry.amount, 0);

  const byPaymentMethod = Array.from(revenues.filter(isSettled).reduce((map, entry) => {
    const key = entry.paymentMethod || 'nao-informado';
    const current = map.get(key) || { method: key, amount: 0, count: 0 };
    current.amount += entry.amount;
    current.count += 1;
    map.set(key, current);
    return map;
  }, new Map<string, { method: string; amount: number; count: number }>()).values());

  const byEvent = Array.from(active.filter((entry) => entry.eventId).reduce((map, entry) => {
    const current = map.get(entry.eventId) || { eventId: entry.eventId, received: 0, receivable: 0, costs: 0 };
    if (entry.type === 'cost') current.costs += entry.amount;
    else if (isSettled(entry)) current.received += entry.amount;
    else current.receivable += entry.amount;
    map.set(entry.eventId, current);
    return map;
  }, new Map<string, { eventId: string; received: number; receivable: number; costs: number }>()).values());

  res.json({
    totalIncome: realizedIncome + projectedIncome,
    totalExpense: realizedExpense + projectedExpense,
    realizedIncome,
    projectedIncome,
    realizedExpense,
    projectedExpense,
    openReceivables: projectedIncome,
    netRealized: realizedIncome - realizedExpense,
    byPaymentMethod,
    byEvent,
  });
});

router.post('/', validate(createFinanceSchema), async (req, res) => {
  const normalized = {
    ...req.body,
    origin: req.body.origin || 'manual',
    kind: req.body.kind || 'manual',
    automatic: req.body.automatic ?? false,
    settlementStatus: req.body.settlementStatus || (['paid', 'received'].includes(req.body.status) ? 'settled' : 'open'),
    settledAt: req.body.settledAt || (['paid', 'received'].includes(req.body.status) ? new Date().toISOString() : undefined),
  };
  const Model = isFromFactory(req) ? FactoryFinance : isFromFranchise(req) ? FranchiseFinance : Finance;
  if (normalized.externalId && await Model.exists({ externalId: normalized.externalId })) {
    return res.status(409).json({ error: 'Este movimento bancario ja foi importado' });
  }
  if (isFromFactory(req)) {
    const finance = await FactoryFinance.create({ ...normalized, source: 'factory' });
    await logAudit({ req, action: 'create', resource: 'finances', resourceId: finance.id, description: `Criou lançamento: ${finance.description} (R$ ${finance.amount})` });
    return res.status(201).json(finance);
  }
  if (isFromFranchise(req)) {
    const finance = await FranchiseFinance.create({ ...normalized, source: 'franchise' });
    await logAudit({ req, action: 'create', resource: 'finances', resourceId: finance.id, description: `Criou lançamento: ${finance.description} (R$ ${finance.amount})` });
    return res.status(201).json(finance);
  }
  const finance = await Finance.create({ ...normalized, source: 'main' });
  await logAudit({ req, action: 'create', resource: 'finances', resourceId: finance.id, description: `Criou lançamento: ${finance.description} (R$ ${finance.amount})` });
  res.status(201).json(finance);
});

const STATUS_LABELS: Record<string, string> = { pending: 'Pendente', paid: 'Pago', received: 'Recebido' };

router.put('/:id', validate(updateFinanceSchema), async (req, res) => {
  const found = await findFinanceInBothCollections(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const oldDoc = found.doc;
  const protectedFields = ['amount', 'type', 'category', 'eventId', 'kind', 'origin'];
  if ((oldDoc as any).automatic && protectedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
    return res.status(409).json({ error: 'LanÃ§amentos automÃ¡ticos devem ser alterados pelo evento de origem' });
  }
  const update = { ...req.body };
  if (req.body.status && ['paid', 'received'].includes(req.body.status)) {
    update.settlementStatus = 'settled';
    update.settledAt = (oldDoc as any).settledAt || new Date().toISOString();
  } else if (req.body.status === 'pending') {
    update.settlementStatus = 'open';
    update.settledAt = undefined;
  }
  const finance = await found.model.findByIdAndUpdate(req.params.id, update, { new: true });
  // Detect status-only change to produce a specific audit message
  const changedKeys = Object.keys(req.body);
  let desc: string;
  if (changedKeys.length === 1 && changedKeys[0] === 'status') {
    const from = STATUS_LABELS[(oldDoc as any).status] || (oldDoc as any).status;
    const to   = STATUS_LABELS[req.body.status] || req.body.status;
    desc = `Alterou status de "${from}" para "${to}": ${finance?.description}`;
  } else {
    desc = `Atualizou lançamento: ${finance?.description} (R$ ${finance?.amount})`;
  }
  await logAudit({ req, action: 'update', resource: 'finances', resourceId: req.params.id, description: desc });
  res.json(finance);
});

router.post('/:id/reverse', async (req, res) => {
  const found = await findFinanceInBothCollections(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  // Automatic entries are reversed (not deleted) so their audit history is preserved.
  if ((found.doc as any).automatic) (found.doc as any).automatic = false;
  if ((found.doc as any).reversedAt) return res.status(409).json({ error: 'LanÃ§amento jÃ¡ estornado' });
  if ((found.doc as any).automatic) return res.status(409).json({ error: 'Altere o evento ou pedido de origem para estornar este lanÃ§amento automÃ¡tico' });
  const reversedAt = new Date().toISOString();
  const finance = await found.model.findByIdAndUpdate(req.params.id, {
    reversedAt,
    reversedBy: (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
    reversalReason: req.body?.reason || 'Estorno manual',
    settlementStatus: 'cancelled',
  }, { new: true });
  await logAudit({ req, action: 'update', resource: 'finances', resourceId: req.params.id, description: `Estornou lanÃ§amento: ${(found.doc as any).description}` });
  res.json(finance);
});

router.delete('/:id', async (req, res) => {
  const found = await findFinanceInBothCollections(req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const finance = found.doc;
  if ((finance as any).automatic) return res.status(409).json({ error: 'Use o estorno para lanÃ§amentos automÃ¡ticos' });
  await found.model.findByIdAndDelete(req.params.id);
  await logAudit({ req, action: 'delete', resource: 'finances', resourceId: req.params.id, description: `Excluiu lançamento: ${finance?.description}` });
  res.status(204).end();
});

export default router;
