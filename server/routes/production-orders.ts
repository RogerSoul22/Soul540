import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { FactoryFinance } from './finances';
import { getTenantUnit } from '../middleware/tenant';
import { logAudit } from '../utils/audit';
import { canChangeForecast } from '../../shared/financePolicy';
import { toCents } from '../../shared/money';

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
  commercialValue: { type: Number, default: 0 },
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
  if (order.accountingTreatment !== 'external_sale') return 'none';
  if (order.status !== 'entregue') return 'none';
  if (Number(order.commercialValue) <= 0) return 'none';
  return 'open';
}

export function canSynchronizeOrderForecast(finance: any): boolean {
  return canChangeForecast(finance);
}

async function syncFinanceForProductionOrder(doc: any, req?: any) {
  const eventId = getProductionOrderFinanceEventId(doc.unit, doc.id);
  const existing = await FactoryFinance.findOne({
    eventId,
    source: 'factory',
    reversedAt: { $exists: false },
    settlementStatus: { $ne: 'cancelled' },
  }).lean();

  if (existing && !canSynchronizeOrderForecast(existing)) return;

  if (getProductionOrderFinanceState(doc) === 'none') {
    await FactoryFinance.updateMany(
    { eventId, source: 'factory', reversedAt: { $exists: false }, settlementStatus: 'open' },
      { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Pedido sem receita externa ativa', settlementStatus: 'cancelled' } },
    );
    return;
  }

  const finance = await FactoryFinance.findOneAndUpdate(
    { eventId, source: 'factory', settlementStatus: { $ne: 'cancelled' } },
    {
      $set: {
        eventId,
        type: 'revenue',
        category: 'outro',
        description: `Pedido #${doc.orderNumber || doc.id} - ${doc.filial}`,
        amount: doc.commercialValue,
        amountCents: toCents(doc.commercialValue),
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
}

router.get('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const docs = await ProductionOrderModel.find({ unit }).sort({ createdAt: -1 });
  res.json(docs);
});

router.post('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const last = await ProductionOrderModel.findOne({ unit }).sort({ orderNumber: -1 });
  const orderNumber = (last?.orderNumber || 0) + 1;
  const doc = await ProductionOrderModel.create({
    ...req.body,
    unit,
    accountingTreatment: req.body.accountingTreatment || 'internal_transfer',
    orderNumber,
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
    { $set: { reversedAt: new Date().toISOString(), reversalReason: 'Pedido excluÃ­do', settlementStatus: 'cancelled' } },
  );
  res.status(204).end();
});

export default router;
