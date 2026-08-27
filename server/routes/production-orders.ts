import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { FactoryFinance } from './finances';
import { Event, FranchiseEvent } from './events';
import { getTenantUnit } from '../middleware/tenant';
import { logAudit } from '../utils/audit';
import { canChangeForecast } from '../../shared/financePolicy';

const PedidoItemSchema = new Schema({
  id: { type: String, required: true },
  nome: { type: String, required: true },
  measure: { type: String, default: 'un' },
  quantidade: { type: Number, default: 0 },
}, { _id: false });

const PedidoIngredientSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  measure: { type: String, default: 'un' },
  neededQty: { type: Number, default: 0 },
  neededCost: { type: Number, default: 0 },
}, { _id: false });

const PizzaSizeSchema = new Schema({
  id: { type: String, required: true },
  diameter: { type: Number, default: 25 },
  gramsPerPizza: { type: Number, default: 180 },
}, { _id: false });

const ProductionOrderSchema = new Schema({
  unit: { type: String, required: true, index: true },
  id: { type: String, required: true },
  orderNumber: { type: Number, default: 1 },
  filial: { type: String, required: true, trim: true },
  itens: { type: [PedidoItemSchema], default: [] },
  pizzaSize: { type: PizzaSizeSchema },
  ingredients: { type: [PedidoIngredientSchema], default: [] },
  totalCost: { type: Number, default: 0 },
  accountingTreatment: { type: String, enum: ['internal_transfer', 'external_sale'], default: 'internal_transfer' },
  eventId: String,
  eventSource: { type: String, enum: ['main', 'franchise'] },
  eventName: String,
  eventDate: String,
  status: { type: String, default: 'a_preparar' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { toJSON: { virtuals: true, versionKey: false } });

ProductionOrderSchema.index({ unit: 1, id: 1 }, { unique: true });

const ProductionOrderModel = mongoose.models.ProductionOrder ||
  mongoose.model('ProductionOrder', ProductionOrderSchema);

const router = Router();

function getProductionOrderFinanceEventId(unit: string, orderId: string) {
  return `production-order:${unit}:${orderId}`;
}

function getDateOnly(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function getProductionOrderFinanceState(order: any): 'none' | 'open' {
  if (order.status !== 'entregue') return 'none';
  if (Number(order.totalCost) <= 0) return 'none';
  return 'open';
}

export function canSynchronizeOrderForecast(finance: any): boolean {
  return canChangeForecast(finance);
}

type AvailableProductionEvent = {
  id: string;
  source: 'main' | 'franchise';
  name: string;
  date: string;
  city?: string;
};

async function listAvailableProductionEvents(): Promise<AvailableProductionEvent[]> {
  const eventFilter = { status: { $in: ['confirmed', 'completed'] } };
  const [mainEvents, franchiseEvents] = await Promise.all([
    Event.find(eventFilter).select('name date city').lean(),
    FranchiseEvent.find(eventFilter).select('name date city').lean(),
  ]);

  return [
    ...mainEvents.map((event: any) => ({ id: event._id.toString(), source: 'main' as const, name: event.name, date: event.date, city: event.city })),
    ...franchiseEvents.map((event: any) => ({ id: event._id.toString(), source: 'franchise' as const, name: event.name, date: event.date, city: event.city })),
  ].sort((firstEvent, secondEvent) => firstEvent.date.localeCompare(secondEvent.date));
}

async function findProductionEvent(eventId: string, eventSource: unknown): Promise<AvailableProductionEvent | null> {
  const source = eventSource === 'franchise' ? 'franchise' : eventSource === 'main' ? 'main' : null;
  if (!source || !mongoose.isValidObjectId(eventId)) return null;

  const EventModel = source === 'main' ? Event : FranchiseEvent;
  const event = await EventModel.findOne({ _id: eventId, status: { $in: ['confirmed', 'completed'] } })
    .select('name date city')
    .lean() as any;
  if (!event) return null;

  return { id: event._id.toString(), source, name: event.name, date: event.date, city: event.city };
}

function getProductionOrderFinanceDescription(doc: any) {
  const appointment = doc.eventName ? ` - Agendamento: ${doc.eventName}` : '';
  return `Pedido #${doc.orderNumber || doc.id} - ${doc.filial}${appointment}`;
}

function getProductionOrderRevenueAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Valor do pedido inválido para o financeiro');

  const amountCents = Math.round(amount * 100);
  return { amount: amountCents / 100, amountCents };
}

export function buildProductionOrderFinanceForecast(doc: any) {
  const unit = doc.unit || 'factory';
  const { amount, amountCents } = getProductionOrderRevenueAmount(doc.totalCost);
  return {
    eventId: getProductionOrderFinanceEventId(unit, doc.id),
    type: 'revenue',
    category: 'ingredientes',
    description: getProductionOrderFinanceDescription(doc),
    amount,
    amountCents,
    date: getDateOnly(doc.createdAt),
    status: 'pending',
    settlementStatus: 'open',
    settledCents: 0,
    settlements: [],
    autoEventBudget: false,
    automatic: true,
    origin: 'factory_order',
    kind: 'manual',
    source: 'factory',
  };
}

type ProductionOrderFinanceSyncResult = 'created' | 'updated' | 'preserved' | 'cancelled' | 'not_eligible';

async function syncFinanceForProductionOrder(doc: any, req?: any): Promise<ProductionOrderFinanceSyncResult> {
  const eventId = getProductionOrderFinanceEventId(doc.unit, doc.id);
  const existing = await FactoryFinance.findOne({
    eventId,
    source: 'factory',
    reversedAt: { $exists: false },
    settlementStatus: { $ne: 'cancelled' },
  }).lean();

  if (existing && !canSynchronizeOrderForecast(existing)) return 'preserved';

  if (getProductionOrderFinanceState(doc) === 'none') {
    await FactoryFinance.updateMany(
      { eventId, source: 'factory', reversedAt: { $exists: false }, settlementStatus: 'open' },
      { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Pedido deixou de estar concluído', settlementStatus: 'cancelled' } },
    );
    return existing ? 'cancelled' : 'not_eligible';
  }

  const forecast = buildProductionOrderFinanceForecast(doc);
  const finance = await FactoryFinance.findOneAndUpdate(
    { eventId, source: 'factory', settlementStatus: { $ne: 'cancelled' } },
    {
      $set: {
        ...forecast,
      },
      $unset: { reversedAt: 1, reversedBy: 1, reversalReason: 1, settledAt: 1 },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  if (req) {
    await logAudit({
      req,
      action: 'update',
      resource: 'finances',
      resourceId: finance.id,
      description: `Gerou receita do pedido finalizado: ${finance.description} (R$ ${finance.amount})`,
    });
  }

  return existing ? 'updated' : 'created';
}

router.get('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const docs = await ProductionOrderModel.find({ unit }).sort({ createdAt: -1 });
  res.json(docs);
});

router.get('/available-events', async (req, res) => {
  if (getTenantUnit(req) !== 'factory') return res.status(403).json({ error: 'Apenas a fábrica pode consultar agendamentos de produção' });
  res.json(await listAvailableProductionEvents());
});

router.post('/reconcile-finances', async (req, res) => {
  const unit = getTenantUnit(req);
  if (unit !== 'factory') return res.status(403).json({ error: 'Apenas a fábrica pode reconciliar receitas de pedidos' });

  const orders = await ProductionOrderModel.find({ unit }).sort({ createdAt: -1 });
  const results = await Promise.all(orders.map((order) => syncFinanceForProductionOrder(order)));
  const summary = results.reduce<Record<ProductionOrderFinanceSyncResult, number>>((counts, result) => {
    counts[result] += 1;
    return counts;
  }, { created: 0, updated: 0, preserved: 0, cancelled: 0, not_eligible: 0 });

  await logAudit({
    req,
    action: 'update',
    resource: 'finances',
    resourceId: 'factory-order-reconciliation',
    description: `Reconciliação de pedidos da fábrica: ${summary.created} receitas criadas e ${summary.updated} previsões atualizadas`,
  });

  res.json({ orders: orders.length, ...summary });
});

router.post('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const last = await ProductionOrderModel.findOne({ unit }).sort({ orderNumber: -1 });
  const orderNumber = (last?.orderNumber || 0) + 1;
  const linkedEvent = req.body.eventId ? await findProductionEvent(req.body.eventId, req.body.eventSource) : null;
  if (req.body.eventId && !linkedEvent) return res.status(400).json({ error: 'Agendamento informado não está disponível para produção' });
  const doc = await ProductionOrderModel.create({
    ...req.body,
    unit,
    accountingTreatment: req.body.accountingTreatment || 'internal_transfer',
    orderNumber,
    ...(linkedEvent ? {
      eventId: linkedEvent.id,
      eventSource: linkedEvent.source,
      eventName: linkedEvent.name,
      eventDate: linkedEvent.date,
      filial: linkedEvent.city || req.body.filial,
    } : {}),
    status: req.body.status || 'a_preparar',
    createdAt: req.body.createdAt || new Date().toISOString(),
  });
  await syncFinanceForProductionOrder(doc, req);
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const unit = getTenantUnit(req);
  const doc = await ProductionOrderModel.findOneAndUpdate(
    { unit, id: req.params.id },
    req.body,
    { new: true },
  );

  if (!doc) return res.status(404).json({ error: 'Pedido não encontrado' });
  await syncFinanceForProductionOrder(doc, req);
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  const unit = getTenantUnit(req);
  const doc = await ProductionOrderModel.findOneAndDelete({ unit, id: req.params.id });

  if (!doc) return res.status(404).json({ error: 'Pedido não encontrado' });
  await FactoryFinance.updateMany(
    { eventId: getProductionOrderFinanceEventId(unit, doc.id), source: 'factory', reversedAt: { $exists: false } },
    { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Pedido excluído', settlementStatus: 'cancelled' } },
  );
  res.status(204).end();
});

export default router;
