import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { Finance, FranchiseFinance, FactoryFinance } from './finances';
import { Employee, FranchiseEmployee } from './employees';
import { getTenantUnit } from '../middleware/tenant';
import { logAudit } from '../utils/audit';
import { getEventUnitsForRequest, type EventUnit } from '../utils/eventTenant';
import { toCents } from '../../shared/money';
import { canChangeForecast, getSettledCents } from '../../shared/financePolicy';

const EventSchema = new Schema({
  name: String,
  date: String,
  endDate: String,
  time: String,
  duration: String,
  location: String,
  outOfCity: Boolean,
  phone: String,
  guestCount: { type: Number, default: 0 },
  status: { type: String, default: 'planning' },
  budget: { type: Number, default: 0 },
  menu: [String],
  notes: { type: String, default: '' },
  responsibleEmployeeId: String,
  staffCount: Number,
  selectedEmployeeIds: [String],
  paymentProofName: String,
  contractPdfName: String,
  createdBy: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  source: { type: String, default: 'main' },
  celebration: String,
  teamArrivalTime: String,
  city: String,
  guestsAdult: Number,
  guestsTeen: Number,
  guestsChild: Number,
  travelCost: Number,
  teamPizzaiolo: String,
  teamHelper: String,
  teamGarcon: String,
  extrasLoucas: Number,
  extrasBebidas: Number,
  finalValue: Number,
  paymentMethod: String,
  locationImageName: String,
  locationImageData: String,
  paymentProofData: String,
  contractPdfData: String,
  depositValue: Number,
  depositDate: String,
  pixKey: String,
  estimatedPizzas: Number,
  actualPizzas: Number,
  factoryProductionStatus: { type: String, default: 'pending' },
  factoryProductionNotes: String,
  factoryDoughBalls: Number,
  factorySauceKg: Number,
  factoryCheeseKg: Number,
  factoryPackagingUnits: Number,
  financialStatus: { type: String, enum: ['open', 'partial', 'settled', 'closed'], default: 'open' },
  financialCloseStatus: { type: String, enum: ['open', 'closed'], default: 'open' },
  financiallyClosedAt: String,
  financiallyClosedBy: String,
  financeSyncVersion: Number,
}, { collection: 'events', toJSON: { virtuals: true, versionKey: false } });

const FranchiseEventSchema = new Schema({
  name: String,
  date: String,
  endDate: String,
  time: String,
  duration: String,
  location: String,
  outOfCity: Boolean,
  phone: String,
  guestCount: { type: Number, default: 0 },
  status: { type: String, default: 'planning' },
  budget: { type: Number, default: 0 },
  menu: [String],
  notes: { type: String, default: '' },
  responsibleEmployeeId: String,
  staffCount: Number,
  selectedEmployeeIds: [String],
  paymentProofName: String,
  contractPdfName: String,
  createdBy: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  source: { type: String, default: 'franchise' },
  celebration: String,
  teamArrivalTime: String,
  city: String,
  guestsAdult: Number,
  guestsTeen: Number,
  guestsChild: Number,
  travelCost: Number,
  teamPizzaiolo: String,
  teamHelper: String,
  teamGarcon: String,
  extrasLoucas: Number,
  extrasBebidas: Number,
  finalValue: Number,
  paymentMethod: String,
  locationImageName: String,
  locationImageData: String,
  paymentProofData: String,
  contractPdfData: String,
  depositValue: Number,
  depositDate: String,
  pixKey: String,
  estimatedPizzas: Number,
  actualPizzas: Number,
  factoryProductionStatus: { type: String, default: 'pending' },
  factoryProductionNotes: String,
  factoryDoughBalls: Number,
  factorySauceKg: Number,
  factoryCheeseKg: Number,
  factoryPackagingUnits: Number,
  financialStatus: { type: String, enum: ['open', 'partial', 'settled', 'closed'], default: 'open' },
  financialCloseStatus: { type: String, enum: ['open', 'closed'], default: 'open' },
  financiallyClosedAt: String,
  financiallyClosedBy: String,
  financeSyncVersion: Number,
}, { collection: 'franchiseevents', toJSON: { virtuals: true, versionKey: false } });

const FactoryEventSchema = new Schema({
  name: String,
  date: String,
  endDate: String,
  time: String,
  duration: String,
  location: String,
  outOfCity: Boolean,
  phone: String,
  guestCount: { type: Number, default: 0 },
  status: { type: String, default: 'planning' },
  budget: { type: Number, default: 0 },
  menu: [String],
  notes: { type: String, default: '' },
  responsibleEmployeeId: String,
  staffCount: Number,
  selectedEmployeeIds: [String],
  paymentProofName: String,
  contractPdfName: String,
  createdBy: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  source: { type: String, default: 'factory' },
  celebration: String,
  teamArrivalTime: String,
  city: String,
  guestsAdult: Number,
  guestsTeen: Number,
  guestsChild: Number,
  travelCost: Number,
  teamPizzaiolo: String,
  teamHelper: String,
  teamGarcon: String,
  extrasLoucas: Number,
  extrasBebidas: Number,
  finalValue: Number,
  paymentMethod: String,
  locationImageName: String,
  locationImageData: String,
  paymentProofData: String,
  contractPdfData: String,
  depositValue: Number,
  depositDate: String,
  pixKey: String,
  estimatedPizzas: Number,
  actualPizzas: Number,
  factoryProductionStatus: { type: String, default: 'pending' },
  factoryProductionNotes: String,
  factoryDoughBalls: Number,
  factorySauceKg: Number,
  factoryCheeseKg: Number,
  factoryPackagingUnits: Number,
  financialStatus: { type: String, enum: ['open', 'partial', 'settled', 'closed'], default: 'open' },
  financialCloseStatus: { type: String, enum: ['open', 'closed'], default: 'open' },
  financiallyClosedAt: String,
  financiallyClosedBy: String,
  financeSyncVersion: Number,
}, { collection: 'factoryevents', toJSON: { virtuals: true, versionKey: false } });

EventSchema.index({ date: -1 });
EventSchema.index({ status: 1, date: -1 });
FranchiseEventSchema.index({ date: -1 });
FranchiseEventSchema.index({ status: 1, date: -1 });
FactoryEventSchema.index({ date: -1 });
FactoryEventSchema.index({ status: 1, date: -1 });

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
export const FranchiseEvent = mongoose.models.FranchiseEvent || mongoose.model('FranchiseEvent', FranchiseEventSchema);
export const FactoryEvent = mongoose.models.FactoryEvent || mongoose.model('FactoryEvent', FactoryEventSchema);

function isFromFranchise(req: any): boolean {
  return getTenantUnit(req) === 'franchise';
}

function isFromFactory(req: any): boolean {
  return getTenantUnit(req) === 'factory';
}

const FACTORY_OPERATIONAL_FIELDS = [
  'factoryProductionStatus',
  'factoryProductionNotes',
  'factoryDoughBalls',
  'factorySauceKg',
  'factoryCheeseKg',
  'factoryPackagingUnits',
  'actualPizzas',
] as const;

function pickFactoryOperationalUpdate(body: Record<string, unknown>) {
  return FACTORY_OPERATIONAL_FIELDS.reduce<Record<string, unknown>>((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) acc[key] = body[key];
    return acc;
  }, {});
}

function getEventStoreForUnit(unit: EventUnit) {
  if (unit === 'factory') return { model: FactoryEvent, financeModel: FactoryFinance, financeSource: 'factory' };
  if (unit === 'franchise') return { model: FranchiseEvent, financeModel: FranchiseFinance, financeSource: 'franchise' };
  return { model: Event, financeModel: Finance, financeSource: 'main' };
}

async function findEventForRequest(req: any, id: string) {
  const store = getEventStoreForUnit(getTenantUnit(req) as EventUnit);
  const doc = await store.model.findById(id);
  return doc ? { doc, ...store } : null;
}

type FinanceModel = typeof Finance;

async function upsertAutomaticEventFinance(
  FinanceModel: FinanceModel,
  event: any,
  source: string,
  kind: 'balance' | 'deposit' | 'travel',
  amount: number,
) {
  const eventId = event.id || event._id.toString();
  const query = { eventId, kind, automatic: true, reversedAt: { $exists: false }, settlementStatus: { $ne: 'cancelled' } };
  let existing = await FinanceModel.findOne(query);

  // Reuse the legacy automatic budget row as the new open-balance row.
  if (!existing && kind === 'balance') {
    existing = await FinanceModel.findOne({ eventId, autoEventBudget: true, reversedAt: { $exists: false }, settlementStatus: { $ne: 'cancelled' } });
  }

  if (existing && !canChangeForecast(existing.toJSON())) return;

  if (amount <= 0) {
    if (existing) {
      await FinanceModel.findByIdAndUpdate(existing._id, {
        settlementStatus: 'cancelled',
        reversedAt: new Date().toISOString(),
        reversalReason: 'Previsão automática sem valor',
      });
    }
    return;
  }

  const isDeposit = kind === 'deposit';
  const isTravel = kind === 'travel';
  const amountChanged = !!existing && Math.abs(Number(existing.amount || 0) - amount) > 0.005;
  const payload = {
    eventId,
    type: isTravel ? 'cost' : 'revenue',
    category: isDeposit ? 'sinal-evento' : isTravel ? 'deslocamento-evento' : 'contrato',
    description: `${isDeposit ? 'Sinal' : isTravel ? 'Deslocamento' : 'Saldo'} - ${event.name}`,
    amount,
    amountCents: toCents(amount),
    date: isDeposit && event.depositDate ? event.depositDate : event.date,
    paymentMethod: event.paymentMethod || undefined,
    origin: 'event',
    kind,
    automatic: true,
    autoEventBudget: kind === 'balance',
    source,
    settledCents: 0,
    settlements: [],
    reversedAt: undefined,
    settlementStatus: amountChanged ? 'open' : existing?.settlementStatus || 'open',
    status: amountChanged ? 'pending' : existing?.status || 'pending',
    settledAt: amountChanged ? undefined : existing?.settledAt,
  };

  if (existing) {
    await FinanceModel.findByIdAndUpdate(existing._id, amountChanged
      ? { $set: payload, $unset: { dueDate: 1, settledAt: 1 } }
      : { $set: payload, $unset: { dueDate: 1 } });
  }
  else await FinanceModel.create(payload);

  const duplicates = await FinanceModel.find(query).sort({ createdAt: 1 });
  if (duplicates.length > 1) {
    await FinanceModel.updateMany(
      { _id: { $in: duplicates.slice(1).map((item) => item._id) } },
      { $set: { settlementStatus: 'cancelled', reversedAt: new Date().toISOString(), reversalReason: 'Previsão automática duplicada' } },
    );
  }
}

export async function syncEventFinances(event: any, FinanceModel: FinanceModel, source: string) {
  if (source === 'factory') return;
  if (event.status === 'cancelled') {
    const eventId = event.id || event._id.toString();
    const linkedEntries = await FinanceModel.find({
      eventId,
      $or: [{ automatic: true }, { autoEventBudget: true }],
      settlementStatus: { $ne: 'cancelled' },
    }).lean();
    const neverSettledIds = linkedEntries.filter((entry: any) => !(getSettledCents(entry) > 0)).map((entry: any) => entry._id);
    const settledIds = linkedEntries.filter((entry: any) => getSettledCents(entry) > 0).map((entry: any) => entry._id);
    if (neverSettledIds.length > 0) {
      await FinanceModel.deleteMany({ _id: { $in: neverSettledIds }, settledCents: { $not: { $gt: 0 } } });
    }
    if (settledIds.length > 0) {
      await FinanceModel.updateMany(
        { _id: { $in: settledIds } },
        { $set: { settlementStatus: 'cancelled', reversalReason: 'Evento cancelado' } },
      );
    }
    return { deletedCount: neverSettledIds.length };
  }
  const { deposit, travel, targetRevenue, balance } = calculateEventFinanceAmounts(event);

  await Promise.all([
    upsertAutomaticEventFinance(FinanceModel, event, source, 'balance', balance),
    upsertAutomaticEventFinance(FinanceModel, event, source, 'deposit', deposit),
    upsertAutomaticEventFinance(FinanceModel, event, source, 'travel', travel),
  ]);

  if (event.financialCloseStatus !== 'closed' && event.financialStatus !== 'closed') {
    const financialStatus = targetRevenue > 0 && balance === 0 ? 'settled' : deposit > 0 ? 'partial' : 'open';
    await event.constructor.findByIdAndUpdate(event._id, { financialStatus, financeSyncVersion: 1 });
    event.financialStatus = financialStatus;
  } else {
    await event.constructor.findByIdAndUpdate(event._id, { financeSyncVersion: 1 });
  }
  return { deletedCount: 0 };
}

export function calculateEventFinanceAmounts(event: any) {
  const budget = Math.max(Number(event.budget) || 0, 0);
  const finalValue = Math.max(Number(event.finalValue) || 0, 0);
  const deposit = Math.max(Number(event.depositValue) || 0, 0);
  const travel = Math.max(Number(event.travelCost) || 0, 0);
  const targetRevenue = finalValue > 0 ? finalValue : budget;
  const balance = Math.max(targetRevenue - deposit, 0);
  return { budget, finalValue, deposit, travel, targetRevenue, balance };
}

export function eventCancellationRequiresDecision(finances: any[]): boolean {
  return finances.some((finance) => !canChangeForecast(finance));
}

async function cancellationRequiresDecision(event: any, FinanceModel: FinanceModel): Promise<boolean> {
  const eventId = event.id || event._id.toString();
  const finances = await FinanceModel.find({
    eventId,
    $or: [{ automatic: true }, { autoEventBudget: true }],
    reversedAt: { $exists: false },
    settlementStatus: { $ne: 'cancelled' },
  }).lean();
  return eventCancellationRequiresDecision(finances);
}

async function syncEventCommissions(event: any, FinanceModel: FinanceModel, source: string) {
  const employeeModel = source === 'franchise' ? FranchiseEmployee : Employee;
  const employeeIds = Array.from(new Set([
    ...(Array.isArray(event.selectedEmployeeIds) ? event.selectedEmployeeIds : []),
    event.responsibleEmployeeId,
  ].filter((id) => typeof id === 'string' && mongoose.isValidObjectId(id)))) as string[];
  const eventId = event.id || event._id.toString();
  const activeQuery = { eventId, kind: 'commission', automatic: true, reversedAt: { $exists: false } };

  if (employeeIds.length === 0) {
    await FinanceModel.updateMany(activeQuery, { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Equipe removida do evento', settlementStatus: 'cancelled' } });
    return;
  }

  const employees = await employeeModel.find({ _id: { $in: employeeIds }, commissionRate: { $gt: 0 } }).lean() as any[];
  const { targetRevenue } = calculateEventFinanceAmounts(event);
  const eligibleIds = employees.map((employee) => employee._id.toString());

  await FinanceModel.updateMany(
    { ...activeQuery, employeeId: { $nin: eligibleIds } },
    { $set: { reversedAt: new Date().toISOString(), reversalReason: 'ComissÃ£o deixou de ser aplicÃ¡vel', settlementStatus: 'cancelled' } },
  );

  for (const employee of employees) {
    const amount = calculateCommissionAmount(targetRevenue, Number(employee.commissionRate));
    if (amount <= 0) continue;
    await FinanceModel.findOneAndUpdate(
      { ...activeQuery, employeeId: employee._id.toString() },
      {
        eventId,
        employeeId: employee._id.toString(),
        type: 'cost',
        category: 'comissoes',
        description: `ComissÃ£o ${employee.commissionRate}% - ${employee.name} - ${event.name}`,
        amount,
        date: event.date,
        dueDate: event.date,
        status: 'pending',
        settlementStatus: 'open',
        origin: 'event',
        kind: 'commission',
        automatic: true,
        source,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

export function calculateCommissionAmount(revenue: number, rate: number) {
  const safeRevenue = Math.max(Number(revenue) || 0, 0);
  const safeRate = Math.min(100, Math.max(Number(rate) || 0, 0));
  return Math.round((safeRevenue * safeRate / 100) * 100) / 100;
}

export async function backfillEventFinances() {
  const [mainEvents, franchiseEvents] = await Promise.all([
    Event.find({ financeSyncVersion: { $ne: 1 } }),
    FranchiseEvent.find({ financeSyncVersion: { $ne: 1 } }),
  ]);
  const runInBatches = async (events: any[], model: FinanceModel, source: string) => {
    const batchSize = 50;
    for (let index = 0; index < events.length; index += batchSize) {
      await Promise.all(events.slice(index, index + batchSize).map((event) => syncEventFinances(event, model, source)));
    }
  };
  await runInBatches(mainEvents, Finance, 'main');
  await runInBatches(franchiseEvents, FranchiseFinance, 'franchise');
  return { main: mainEvents.length, franchise: franchiseEvents.length };
}

const router = Router();

const SLIM = '-locationImageData -paymentProofData -contractPdfData';

// Lightweight count endpoint — used by portal cards
router.get('/count', async (req, res) => {
  if (isFromFactory(req)) {
    const count = await FactoryEvent.countDocuments({});
    return res.json({ count });
  }
  if (isFromFranchise(req)) {
    const count = await FranchiseEvent.countDocuments({});
    return res.json({ count });
  }
  const count = await Event.countDocuments({});
  res.json({ count });
});

router.get('/', async (req, res) => {
  const scope = String(req.query.scope || getTenantUnit(req));
  const stores = getEventUnitsForRequest(req, scope).map(getEventStoreForUnit);
  const groups = await Promise.all(stores.map((store) => store.model.find({}).select(SLIM).sort({ date: 1 })));
  const events = groups.flat().sort((a, b) => (a.date > b.date ? 1 : -1));
  res.json(events);
});

router.post('/', async (req, res) => {
  if (isFromFactory(req)) {
    return res.status(403).json({ error: 'Factory can only update operational production fields' });
  }
  if (isFromFranchise(req)) {
    const event = await FranchiseEvent.create({ ...req.body, source: 'franchise' });
    await syncEventFinances(event, FranchiseFinance, 'franchise');
    await logAudit({ req, action: 'create', resource: 'events', resourceId: event.id, description: `Criou evento: ${event.name} (${event.date})` });
    return res.status(201).json(event);
  }
  const event = await Event.create({ ...req.body, source: 'main' });
  await syncEventFinances(event, Finance, 'main');
  await logAudit({ req, action: 'create', resource: 'events', resourceId: event.id, description: `Criou evento: ${event.name} (${event.date})` });
  res.status(201).json(event);
});

router.post('/:id/financial-close', async (req, res) => {
  if (isFromFactory(req)) return res.status(403).json({ error: 'Factory cannot close event finances' });
  const found = await findEventForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });

  await syncEventFinances(found.doc, found.financeModel, found.financeSource);
  await syncEventCommissions(found.doc, found.financeModel, found.financeSource);
  const closedAt = new Date().toISOString();
  const event = await found.model.findByIdAndUpdate(req.params.id, {
    financialStatus: 'closed',
    financialCloseStatus: 'closed',
    financiallyClosedAt: closedAt,
    financiallyClosedBy: (req as any).user?._id?.toString() || (req as any).user?.id || 'system',
  }, { new: true });
  await logAudit({ req, action: 'update', resource: 'events', resourceId: req.params.id, description: `Fechou financeiro do evento: ${found.doc.name}` });
  res.json(event);
});

router.post('/:id/financial-reopen', async (req, res) => {
  if (isFromFactory(req)) return res.status(403).json({ error: 'Factory cannot reopen event finances' });
  const found = await findEventForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });

  const { targetRevenue: target, balance } = calculateEventFinanceAmounts(found.doc);
  const financialStatus = target > 0 && balance === 0 ? 'settled' : Number(found.doc.depositValue) > 0 ? 'partial' : 'open';
  const event = await found.model.findByIdAndUpdate(req.params.id, {
    $set: { financialStatus, financialCloseStatus: 'open' },
    $unset: { financiallyClosedAt: 1, financiallyClosedBy: 1 },
  }, { new: true });
  await found.financeModel.updateMany(
    { eventId: found.doc.id, kind: 'commission', automatic: true, reversedAt: { $exists: false } },
    { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Financeiro do evento reaberto', settlementStatus: 'cancelled' } },
  );
  await logAudit({ req, action: 'update', resource: 'events', resourceId: req.params.id, description: `Reabriu financeiro do evento: ${found.doc.name}` });
  res.json(event);
});

router.put('/:id', async (req, res) => {
  const found = await findEventForRequest(req, req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  if (req.body?.status === 'cancelled' && found.doc.status !== 'cancelled' && await cancellationRequiresDecision(found.doc, found.financeModel)) {
    return res.status(409).json({ error: 'Registre reembolso, multa retida ou ajuste aprovado antes de cancelar um evento com baixa financeira' });
  }
  const protectedFinancialFields = ['budget', 'finalValue', 'depositValue', 'depositDate', 'travelCost', 'paymentMethod', 'pixKey'];
  if (
    (found.doc.financialCloseStatus === 'closed' || found.doc.financialStatus === 'closed') &&
    !isFromFactory(req) &&
    protectedFinancialFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))
  ) {
    return res.status(409).json({ error: 'Reabra o financeiro do evento antes de alterar valores financeiros' });
  }
  const updateData = isFromFactory(req) ? pickFactoryOperationalUpdate(req.body) : req.body;
  if (isFromFactory(req) && Object.keys(updateData).length === 0) {
    return res.status(403).json({ error: 'Factory can only update operational production fields' });
  }
  const event = await found.model.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!event) return res.status(404).json({ error: 'Not found' });
  const syncResult = isFromFactory(req) ? undefined : await syncEventFinances(event, found.financeModel, found.financeSource);
  await logAudit({ req, action: 'update', resource: 'events', resourceId: req.params.id, description: `Atualizou evento: ${event.name}` });
  if (syncResult && syncResult.deletedCount > 0) {
    await logAudit({
      req,
      action: 'delete',
      resource: 'finances',
      resourceId: req.params.id,
      description: `Excluiu ${syncResult.deletedCount} lançamento(s) automático(s) nunca liquidado(s) do evento cancelado: ${event.name}`,
    });
  }
  res.json(event);
});

router.delete('/:id', async (req, res) => {
  if (isFromFactory(req)) {
    return res.status(403).json({ error: 'Factory cannot delete events' });
  }
  const found = await findEventForRequest(req, req.params.id);
  if (!found) return res.status(204).end();
  if (await cancellationRequiresDecision(found.doc, found.financeModel)) {
    return res.status(409).json({ error: 'Registre reembolso, multa retida ou ajuste aprovado antes de excluir um evento com baixa financeira' });
  }
  const eventName = found.doc?.name || req.params.id;
  await found.model.findByIdAndDelete(req.params.id);
  await found.financeModel.updateMany(
    { eventId: req.params.id, $or: [{ automatic: true }, { autoEventBudget: true }] },
    { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Evento excluÃ­do' } },
  );
  await logAudit({ req, action: 'delete', resource: 'events', resourceId: req.params.id, description: `Excluiu evento: ${eventName}` });
  res.status(204).end();
});

export default router;
