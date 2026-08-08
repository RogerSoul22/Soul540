import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { createFinanceSchema, createSettlementSchema, importOfxSchema, previewOfxSchema, updateFinanceSchema } from '../schemas/finances';
import { logAudit } from '../utils/audit';
import { buildBankImportPayload, buildManualFinancePayload, buildSettlementRecord, getClassificationStatusForCategory, resolveFinanceStatusChange } from '../services/financeCommands';
import { buildOfxSuggestions, parseOfxTransactions, type OfxTransaction } from '../services/ofx';
import {
  calculateSettlementStatus,
  getEffectiveSettlements,
  getFinanceAmountCents,
  getSettledCents,
} from '../../shared/financePolicy';
import { toCents } from '../../shared/money';
import { fromCents } from '../../shared/money';
import { buildFinanceSummary } from '../../shared/financeSummary';

const FinanceSettlementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  amountCents: { type: Number, required: true, min: 1 },
  externalId: { type: String, maxlength: 300 },
  settledOn: { type: String, required: true },
  settledAt: { type: String, required: true },
  paymentMethod: String,
  settledBy: String,
  reason: String,
  idempotencyKey: { type: String, required: true },
}, { _id: false });

const FinanceSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: '' },
    type: { type: String, enum: ['revenue', 'cost'], required: true },
    category: { type: String, required: true },
    classificationStatus: { type: String, enum: ['classified', 'unclassified'], default: 'classified' },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    amountCents: { type: Number, min: 1 },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'received'], default: 'pending' },
    autoEventBudget: { type: Boolean, default: false },
    origin: { type: String, enum: ['event', 'manual', 'factory_order', 'bank_import'], default: 'manual' },
    kind: { type: String, enum: ['balance', 'deposit', 'travel', 'commission', 'expense', 'manual'], default: 'manual' },
    employeeId: String,
    paymentMethod: String,
    dueDate: String,
    settledAt: String,
    settledCents: { type: Number, default: 0, min: 0 },
    settlements: { type: [FinanceSettlementSchema], default: [] },
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
    recurrenceFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    recurrenceEndDate: { type: String },
    recurrenceInterval: { type: Number },
    recurrenceTotal: { type: Number },
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
    classificationStatus: { type: String, enum: ['classified', 'unclassified'], default: 'classified' },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    amountCents: { type: Number, min: 1 },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'received'], default: 'pending' },
    autoEventBudget: { type: Boolean, default: false },
    origin: { type: String, enum: ['event', 'manual', 'factory_order', 'bank_import'], default: 'manual' },
    kind: { type: String, enum: ['balance', 'deposit', 'travel', 'commission', 'expense', 'manual'], default: 'manual' },
    employeeId: String,
    paymentMethod: String,
    dueDate: String,
    settledAt: String,
    settledCents: { type: Number, default: 0, min: 0 },
    settlements: { type: [FinanceSettlementSchema], default: [] },
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
    recurrenceFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    recurrenceEndDate: { type: String },
    recurrenceInterval: { type: Number },
    recurrenceTotal: { type: Number },
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
    classificationStatus: { type: String, enum: ['classified', 'unclassified'], default: 'classified' },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    amountCents: { type: Number, min: 1 },
    date: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'received'], default: 'pending' },
    autoEventBudget: { type: Boolean, default: false },
    origin: { type: String, enum: ['event', 'manual', 'factory_order', 'bank_import'], default: 'manual' },
    kind: { type: String, enum: ['balance', 'deposit', 'travel', 'commission', 'expense', 'manual'], default: 'manual' },
    employeeId: String,
    paymentMethod: String,
    dueDate: String,
    settledAt: String,
    settledCents: { type: Number, default: 0, min: 0 },
    settlements: { type: [FinanceSettlementSchema], default: [] },
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
    recurrenceFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    recurrenceEndDate: { type: String },
    recurrenceInterval: { type: Number },
    recurrenceTotal: { type: Number },
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
FinanceSchema.index({ 'settlements.externalId': 1 }, { unique: true, sparse: true });
FranchiseFinanceSchema.index({ source: 1, date: -1 });
FranchiseFinanceSchema.index({ eventId: 1 });
FranchiseFinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FranchiseFinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });
FranchiseFinanceSchema.index({ 'settlements.externalId': 1 }, { unique: true, sparse: true });
FactoryFinanceSchema.index({ source: 1, date: -1 });
FactoryFinanceSchema.index({ eventId: 1 });
FactoryFinanceSchema.index({ eventId: 1, kind: 1, automatic: 1 });
FactoryFinanceSchema.index({ externalId: 1 }, { unique: true, sparse: true });
FactoryFinanceSchema.index({ 'settlements.externalId': 1 }, { unique: true, sparse: true });

export const Finance = mongoose.models.Finance || mongoose.model('Finance', FinanceSchema);
export const FranchiseFinance = mongoose.models.FranchiseFinance || mongoose.model('FranchiseFinance', FranchiseFinanceSchema);
export const FactoryFinance = mongoose.models.FactoryFinance || mongoose.model('FactoryFinance', FactoryFinanceSchema);

function isFromFranchise(req: any): boolean { return getTenantUnit(req) === 'franchise'; }
function isFromFactory(req: any): boolean { return getTenantUnit(req) === 'factory'; }

export function getFinanceModelForUnit(unit: string) {
  if (unit === 'factory') return FactoryFinance;
  if (unit === 'franchise') return FranchiseFinance;
  return Finance;
}

export function getFinanceModelsForRequest(req: any, scope: string) {
  const tenantUnit = getTenantUnit(req);
  if (!req.user?.isAdmin) return [getFinanceModelForUnit(tenantUnit)];
  if (scope === 'combined') return [Finance, FranchiseFinance, FactoryFinance];
  return [getFinanceModelForUnit(scope)];
}

export function getFinanceReverseError(entry: { automatic?: boolean; reversedAt?: string }): string | undefined {
  if (entry.reversedAt) return 'Lançamento já estornado';
  if (entry.automatic) return 'Altere o evento ou pedido de origem para estornar este lançamento automático';
  return undefined;
}

async function findFinanceForRequest(req: any, id: string) {
  const model = getFinanceModelForUnit(getTenantUnit(req));
  const doc = await model.findById(id);
  if (doc) return { doc, model };
  return null;
}

export function serializeFinanceEntry(entry: any) {
  const raw = entry?.toJSON ? entry.toJSON() : entry;
  const settlementStatus = calculateSettlementStatus(raw);
  const settledCents = getSettledCents(raw);
  return {
    ...raw,
    amountCents: getFinanceAmountCents(raw),
    settledCents,
    settlements: getEffectiveSettlements(raw),
    settlementStatus,
    status: settlementStatus === 'settled' ? (raw.type === 'revenue' ? 'received' : 'paid') : 'pending',
  };
}

function getAuthenticatedUserId(req: any): string {
  return req.user?._id?.toString() || req.user?.id || 'system';
}

async function appendSettlementToFinance(model: any, document: any, settlement: any) {
  let entry = document?.toJSON ? document.toJSON() : document;
  const existing = Array.isArray(entry.settlements)
    ? entry.settlements.find((item: any) => item.idempotencyKey === settlement.idempotencyKey || (settlement.externalId && item.externalId === settlement.externalId))
    : undefined;
  if (existing) return { kind: 'duplicate' as const, finance: document };
  if (calculateSettlementStatus(entry) === 'cancelled') {
    return { kind: 'error' as const, status: 409, error: 'Não é possível liquidar um lançamento cancelado' };
  }
  if (entry.settlementStatus === 'partial' && (!Array.isArray(entry.settlements) || entry.settlements.length === 0)) {
    return { kind: 'error' as const, status: 409, error: 'Lançamento legado parcial precisa ser reconciliado antes de nova baixa' };
  }

  const amountCents = getFinanceAmountCents(entry);
  const settledCents = getSettledCents(entry);
  if (settlement.amountCents + settledCents > amountCents) {
    return { kind: 'error' as const, status: 422, error: 'A baixa excede o valor em aberto do lançamento' };
  }
  if (!Number.isSafeInteger(entry.amountCents)) {
    await model.findByIdAndUpdate(entry._id, { $set: { amountCents, settledCents } });
    entry = { ...entry, amountCents, settledCents };
  }

  const query: Record<string, unknown> = {
    _id: entry._id,
    settlementStatus: { $ne: 'cancelled' },
    'settlements.idempotencyKey': { $ne: settlement.idempotencyKey },
    $expr: {
      $lte: [
        { $add: [{ $ifNull: ['$settledCents', 0] }, settlement.amountCents] },
        '$amountCents',
      ],
    },
  };
  if (settlement.externalId) query['settlements.externalId'] = { $ne: settlement.externalId };
  const updated = await model.findOneAndUpdate(
    query,
    [
      {
        $set: {
          settlements: { $concatArrays: [{ $ifNull: ['$settlements', []] }, [settlement]] },
          settledCents: { $add: [{ $ifNull: ['$settledCents', 0] }, settlement.amountCents] },
          settledAt: settlement.settledAt,
        },
      },
      {
        $set: {
          settlementStatus: { $cond: [{ $gte: ['$settledCents', '$amountCents'] }, 'settled', 'partial'] },
          status: { $cond: [{ $gte: ['$settledCents', '$amountCents'] }, entry.type === 'revenue' ? 'received' : 'paid', 'pending'] },
        },
      },
    ],
    { new: true },
  );
  if (updated) return { kind: 'created' as const, finance: updated };

  const latest = await model.findById(entry._id);
  const duplicated = latest?.toJSON?.().settlements?.some((item: any) => (
    item.idempotencyKey === settlement.idempotencyKey || (settlement.externalId && item.externalId === settlement.externalId)
  ));
  if (duplicated) return { kind: 'duplicate' as const, finance: latest };
  return { kind: 'error' as const, status: 409, error: 'Não foi possível registrar a baixa; atualize e tente novamente' };
}

async function linkOfxTransaction(model: any, transaction: OfxTransaction, financeId: string, settledBy: string) {
  const document = await model.findById(financeId);
  if (!document) return { kind: 'error' as const, status: 404, error: 'Previsão financeira não encontrada' };
  const preview = buildOfxSuggestions([transaction], [document.toJSON()])[0];
  if (preview.decision === 'duplicate') return { kind: 'duplicate' as const, finance: document };
  if (preview.decision !== 'link' || preview.financeId !== financeId) {
    return { kind: 'error' as const, status: 409, error: 'A previsão não está mais disponível para esta conciliação' };
  }
  const settlement = buildSettlementRecord({
    amount: transaction.amount,
    settledOn: transaction.date,
    paymentMethod: 'bank',
    reason: `Conciliado pelo extrato OFX: ${transaction.description}`,
    idempotencyKey: transaction.externalId,
    externalId: transaction.externalId,
  }, settledBy);
  return appendSettlementToFinance(model, document, settlement);
}

const router = Router();

router.get('/', async (req, res) => {
  const source = getTenantUnit(req);
  const model = getFinanceModelForUnit(source);
  const items = await model.find({
    source,
    reversedAt: { $exists: false },
    settlementStatus: { $ne: 'cancelled' },
  }).sort({ date: -1 });
  res.json(items.map(serializeFinanceEntry));
});

router.get('/summary', async (req, res) => {
  const requestedScope = String(req.query.scope || '');
  const isAdmin = (req as any).user?.isAdmin === true;
  const scope = isAdmin && ['main', 'franchise', 'factory', 'combined'].includes(requestedScope)
    ? requestedScope
    : getTenantUnit(req);
  const view = req.query.view === 'competence' ? 'competence' : 'cash';
  const requestedReportingUnit = typeof req.query.reportingUnit === 'string' ? req.query.reportingUnit : '';
  const reportingUnit = ['main', 'franchise', 'factory'].includes(requestedReportingUnit)
    ? requestedReportingUnit as 'main' | 'franchise' | 'factory'
    : (scope === 'combined' ? undefined : scope as 'main' | 'franchise' | 'factory');
  const models = isAdmin && reportingUnit === 'main'
    ? [Finance, FranchiseFinance]
    : getFinanceModelsForRequest(req, scope);
  const start = typeof req.query.start === 'string' ? req.query.start : '';
  const end = typeof req.query.end === 'string' ? req.query.end : '';
  const groups = await Promise.all(models.map((model) => model.find({ reversedAt: { $exists: false } }).lean()));
  const entries = groups.flat() as any[];
  const summary = buildFinanceSummary(entries.map((entry) => ({
    ...entry,
    id: entry.id || entry._id?.toString(),
  })), { view, start, end, reportingUnit });

  res.json({
    view,
    period: { start: start || undefined, end: end || undefined },
    reportingUnit,
    totalIncome: fromCents(summary.totalIncomeCents),
    totalExpense: fromCents(summary.totalExpenseCents),
    realizedIncome: fromCents(summary.realizedIncomeCents),
    projectedIncome: fromCents(summary.projectedIncomeCents),
    realizedExpense: fromCents(summary.realizedExpenseCents),
    projectedExpense: fromCents(summary.projectedExpenseCents),
    openReceivables: fromCents(summary.openReceivablesCents),
    netRealized: fromCents(summary.netRealizedCents),
    byPaymentMethod: summary.byPaymentMethod.map((item) => ({ ...item, amount: fromCents(item.amountCents) })),
    byEvent: summary.byEvent.map((item) => ({
      eventId: item.eventId,
      received: fromCents(item.receivedCents),
      receivable: fromCents(item.receivableCents),
      costs: fromCents(item.costsCents),
    })),
    excludedCancelled: summary.excludedCancelled,
  });
});

router.post('/ofx/preview', validate(previewOfxSchema), async (req, res) => {
  const source = getTenantUnit(req);
  const model = getFinanceModelForUnit(source);
  const parsed = parseOfxTransactions(req.body.ofxText);
  const finances = await model.find({ source, reversedAt: { $exists: false } }).lean();
  const suggestions = buildOfxSuggestions(parsed.transactions, finances as any[]);
  res.json({
    bankAccount: parsed.bankAccount,
    statementBalance: parsed.statementBalance,
    suggestions,
  });
});

router.post('/ofx/import', validate(importOfxSchema), async (req, res) => {
  const source = getTenantUnit(req) as 'main' | 'franchise' | 'factory';
  const model = getFinanceModelForUnit(source);
  const parsed = parseOfxTransactions(req.body.ofxText);
  const finances = await model.find({ source, reversedAt: { $exists: false } }).lean();
  const suggestions = buildOfxSuggestions(parsed.transactions, finances as any[]);
  const selections = new Map(req.body.selections.map((selection: any) => [selection.externalId, selection]));
  const importBatchId = `ofx-${randomUUID()}`;
  const settledBy = getAuthenticatedUserId(req);
  const results: Array<Record<string, unknown>> = [];

  for (const suggestion of suggestions) {
    const selection = selections.get(suggestion.externalId) as { category?: string; financeId?: string } | undefined;
    if (!selection) continue;
    if (suggestion.decision === 'duplicate') {
      results.push({ externalId: suggestion.externalId, action: 'ignored_duplicate', financeId: suggestion.financeId });
      continue;
    }
    if (suggestion.decision === 'ambiguous' && !selection.financeId) {
      results.push({ externalId: suggestion.externalId, action: 'needs_decision' });
      continue;
    }

    if (suggestion.decision === 'link' || selection.financeId) {
      const financeId = selection.financeId || suggestion.financeId;
      if (!financeId) {
        results.push({ externalId: suggestion.externalId, action: 'needs_decision' });
        continue;
      }
      const outcome = await linkOfxTransaction(model, suggestion, financeId, settledBy);
      if (outcome.kind === 'error') {
        results.push({ externalId: suggestion.externalId, action: 'conflict', error: outcome.error });
        continue;
      }
      if (outcome.kind === 'created') {
        await logAudit({
          req,
          action: 'update',
          resource: 'finances',
          resourceId: outcome.finance.id,
          description: `Conciliou extrato OFX em ${suggestion.date}: ${outcome.finance.description}`,
        });
      }
      results.push({ externalId: suggestion.externalId, action: outcome.kind === 'created' ? 'linked' : 'ignored_duplicate', financeId: outcome.finance.id });
      continue;
    }

    const existing = await model.exists({
      $or: [
        { externalId: suggestion.externalId },
        { 'settlements.externalId': suggestion.externalId },
      ],
    });
    if (existing) {
      results.push({ externalId: suggestion.externalId, action: 'ignored_duplicate' });
      continue;
    }
    try {
      const finance = await model.create(buildBankImportPayload(suggestion, {
        source,
        bankAccount: parsed.bankAccount,
        bankStatementBalance: parsed.statementBalance,
        importBatchId,
        settledBy,
        category: selection.category,
      }));
      await logAudit({
        req,
        action: 'create',
        resource: 'finances',
        resourceId: finance.id,
        description: `Importou movimento OFX: ${finance.description}`,
      });
      results.push({ externalId: suggestion.externalId, action: 'created_unclassified', financeId: finance.id });
    } catch (error: any) {
      if (error?.code === 11000) {
        results.push({ externalId: suggestion.externalId, action: 'ignored_duplicate' });
        continue;
      }
      throw error;
    }
  }

  res.status(201).json({
    bankAccount: parsed.bankAccount,
    statementBalance: parsed.statementBalance,
    importBatchId,
    results,
  });
});

router.post('/', validate(createFinanceSchema), async (req, res) => {
  const source = getTenantUnit(req) as 'main' | 'franchise' | 'factory';
  const normalized = buildManualFinancePayload(req.body, source);
  const Model = getFinanceModelForUnit(source);
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
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const oldDoc = found.doc;
  let currentDoc: any = oldDoc;

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    const entry = oldDoc.toJSON();
    let command;
    try {
      command = resolveFinanceStatusChange(entry, req.body.status, req.body, getAuthenticatedUserId(req));
    } catch (error: any) {
      return res.status(409).json({ error: error.message });
    }

    if (command.kind === 'settle') {
      const outcome = await appendSettlementToFinance(found.model, oldDoc, command.settlement);
      if (outcome.kind === 'error') return res.status(outcome.status).json({ error: outcome.error });
      if (outcome.kind === 'created') {
        await logAudit({
          req,
          action: 'update',
          resource: 'finances',
          resourceId: req.params.id,
          description: `Alterou status de "${STATUS_LABELS[entry.status] || entry.status}" para "${STATUS_LABELS[req.body.status] || req.body.status}": ${outcome.finance.description}`,
        });
      }
      currentDoc = outcome.finance;
    } else if (command.kind === 'reopen') {
      const updated = await found.model.findOneAndUpdate(
        { _id: entry._id, settlementStatus: { $ne: 'cancelled' } },
        { $set: { settlementStatus: 'open', settledCents: 0, status: 'pending' }, $unset: { settledAt: 1, settlements: 1 } },
        { new: true },
      );
      if (!updated) return res.status(409).json({ error: 'Não é possível reabrir um lançamento cancelado' });
      await logAudit({
        req,
        action: 'update',
        resource: 'finances',
        resourceId: req.params.id,
        description: `Alterou status de "${STATUS_LABELS[entry.status] || entry.status}" para "Pendente": ${updated.description}`,
      });
      currentDoc = updated;
    }
    // command.kind === 'noop': currentDoc segue sendo oldDoc; continua para os outros campos abaixo, se houver.
  }

  if ((oldDoc as any).automatic) {
    const protectedFields = ['amount', 'type', 'category', 'eventId', 'kind', 'origin'];
    if (protectedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
      return res.status(409).json({ error: 'Lançamentos automáticos devem ser alterados pelo evento ou pedido de origem' });
    }
  }
  const commandFields = ['settlementStatus', 'settledAt', 'settledCents', 'settlements', 'origin', 'kind', 'automatic', 'source', 'eventId', 'reversedAt', 'reversedBy', 'reversalReason', 'autoEventBudget'];
  if (commandFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
    return res.status(400).json({ error: 'Use os comandos de liquidar, cancelar ou origem vinculada para alterar a situação financeira' });
  }
  const allowedFields = ['category', 'description', 'amount', 'date', 'dueDate', 'paymentMethod', 'installmentGroupId', 'installmentNumber', 'installmentTotal', 'recurrenceId', 'recurrenceFrequency', 'recurrenceEndDate', 'recurrenceInterval', 'recurrenceTotal'];
  const update = allowedFields.reduce<Record<string, unknown>>((result, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) result[field] = req.body[field];
    return result;
  }, {});
  if (typeof update.category === 'string') {
    update.classificationStatus = getClassificationStatusForCategory(update.category);
  }
  if (Object.keys(update).length === 0) {
    return res.json(serializeFinanceEntry(currentDoc));
  }
  if (Object.prototype.hasOwnProperty.call(update, 'amount')) {
    const currentJson = currentDoc.toJSON ? currentDoc.toJSON() : currentDoc;
    const settledCents = getSettledCents(currentJson);
    const amountChanged = Math.abs(Number(currentJson.amount || 0) - (update.amount as number)) > 0.005;
    if (settledCents > 0 && amountChanged) {
      return res.status(409).json({ error: 'Não altere o valor de um lançamento que já possui baixa' });
    }
    update.amountCents = toCents(update.amount as number);
  }
  const finance = await found.model.findByIdAndUpdate(req.params.id, update, { new: true });
  await logAudit({ req, action: 'update', resource: 'finances', resourceId: req.params.id, description: `Atualizou lançamento: ${finance?.description} (R$ ${finance?.amount})` });
  res.json(serializeFinanceEntry(finance));
});

router.post('/:id/settlements', validate(createSettlementSchema), async (req, res) => {
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });

  const entry = found.doc.toJSON();
  const existing = Array.isArray(entry.settlements)
    ? entry.settlements.find((settlement: any) => settlement.idempotencyKey === req.body.idempotencyKey)
    : undefined;
  if (existing) return res.json(serializeFinanceEntry(found.doc));
  if (calculateSettlementStatus(entry) === 'cancelled') {
    return res.status(409).json({ error: 'Não é possível liquidar um lançamento cancelado' });
  }
  if (entry.settlementStatus === 'partial' && (!Array.isArray(entry.settlements) || entry.settlements.length === 0)) {
    return res.status(409).json({ error: 'Lançamento legado parcial precisa ser reconciliado antes de nova baixa' });
  }

  const amountCents = getFinanceAmountCents(entry);
  const settledCents = getSettledCents(entry);
  const settlement = buildSettlementRecord(
    req.body,
    (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
  );
  if (settlement.amountCents + settledCents > amountCents) {
    return res.status(422).json({ error: 'A baixa excede o valor em aberto do lançamento' });
  }

  if (!Number.isSafeInteger(entry.amountCents)) {
    await found.model.findByIdAndUpdate(entry._id, { $set: { amountCents, settledCents } });
  }

  const updated = await (found.model as any).findOneAndUpdate(
    {
      _id: entry._id,
      settlementStatus: { $ne: 'cancelled' },
      'settlements.idempotencyKey': { $ne: settlement.idempotencyKey },
      $expr: {
        $lte: [
          { $add: [{ $ifNull: ['$settledCents', 0] }, settlement.amountCents] },
          '$amountCents',
        ],
      },
    },
    [
      {
        $set: {
          settlements: { $concatArrays: [{ $ifNull: ['$settlements', []] }, [settlement]] },
          settledCents: { $add: [{ $ifNull: ['$settledCents', 0] }, settlement.amountCents] },
          settledAt: settlement.settledAt,
        },
      },
      {
        $set: {
          settlementStatus: { $cond: [{ $gte: ['$settledCents', '$amountCents'] }, 'settled', 'partial'] },
          status: { $cond: [{ $gte: ['$settledCents', '$amountCents'] }, entry.type === 'revenue' ? 'received' : 'paid', 'pending'] },
        },
      },
    ],
    { new: true },
  );

  if (!updated) {
    const latest = await found.model.findById(entry._id);
    const duplicated = latest?.toJSON?.().settlements?.some((item: any) => item.idempotencyKey === settlement.idempotencyKey);
    if (duplicated) return res.json(serializeFinanceEntry(latest));
    return res.status(409).json({ error: 'Não foi possível registrar a baixa; atualize e tente novamente' });
  }

  await logAudit({
    req,
    action: 'update',
    resource: 'finances',
    resourceId: req.params.id,
    description: `Liquidou ${updated.description} em ${settlement.settledOn}`,
  });
  res.status(201).json(serializeFinanceEntry(updated));
});

router.post('/:id/reverse', async (req, res) => {
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  // Automatic entries are reversed (not deleted) so their audit history is preserved.
  const reverseError = getFinanceReverseError(found.doc as any);
  if (reverseError) return res.status(409).json({ error: reverseError });
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
  const found = await findFinanceForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  const finance = found.doc;
  if ((finance as any).automatic) return res.status(409).json({ error: 'Use o estorno para lanÃ§amentos automÃ¡ticos' });
  await found.model.findByIdAndUpdate(req.params.id, {
    settlementStatus: 'cancelled',
    reversedAt: new Date().toISOString(),
    reversedBy: (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
    reversalReason: 'Cancelamento manual',
  });
  await logAudit({ req, action: 'delete', resource: 'finances', resourceId: req.params.id, description: `Excluiu lançamento: ${finance?.description}` });
  res.status(204).end();
});

export default router;
