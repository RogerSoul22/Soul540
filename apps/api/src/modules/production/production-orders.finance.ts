import mongoose from 'mongoose';
import { FactoryFinance } from '../finance/finance-tenant';
import { Event, FranchiseEvent } from '../events/events.model';
import { logAudit } from '../../infrastructure/audit-log';
import { canChangeForecast } from '../../../../../shared/finance/financePolicy';
export function getProductionOrderFinanceEventId(unit: string, orderId: string) {
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
  franchiseId?: string;
};

export async function listAvailableProductionEvents(): Promise<AvailableProductionEvent[]> {
  const eventFilter = { status: { $in: ['confirmed', 'completed'] } };
  const [mainEvents, franchiseEvents] = await Promise.all([
    Event.find(eventFilter).select('name date city').lean(),
    FranchiseEvent.find(eventFilter).select('name date city').lean(),
  ]);

  return [
    ...mainEvents.map((event: any) => ({
      id: event._id.toString(),
      source: 'main' as const,
      name: event.name,
      date: event.date,
      city: event.city,
    })),
    ...franchiseEvents.map((event: any) => ({
      id: event._id.toString(),
      source: 'franchise' as const,
      name: event.name,
      date: event.date,
      city: event.city,
    })),
  ].sort((firstEvent, secondEvent) => firstEvent.date.localeCompare(secondEvent.date));
}

export async function findProductionEvent(
  eventId: string,
  eventSource: unknown,
): Promise<AvailableProductionEvent | null> {
  const source = eventSource === 'franchise' ? 'franchise' : eventSource === 'main' ? 'main' : null;
  if (!source || !mongoose.isValidObjectId(eventId)) return null;

  const EventModel = source === 'main' ? Event : FranchiseEvent;
  const event = (await EventModel.findOne({ _id: eventId, status: { $in: ['confirmed', 'completed'] } })
    .select('name date city franchiseId')
    .lean()) as any;
  if (!event) return null;

  return {
    id: event._id.toString(),
    source,
    name: event.name,
    date: event.date,
    city: event.city,
    franchiseId: event.franchiseId?.toString(),
  };
}

function getProductionOrderFinanceDescription(doc: any) {
  const appointment = doc.eventName ? ` - Evento: ${doc.eventName}` : '';
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

export type ProductionOrderFinanceSyncResult = 'created' | 'updated' | 'preserved' | 'cancelled' | 'not_eligible';

export async function syncFinanceForProductionOrder(doc: any, req?: any): Promise<ProductionOrderFinanceSyncResult> {
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
      {
        $set: {
          reversedAt: new Date().toISOString(),
          reversalReason: 'Pedido deixou de estar concluído',
          settlementStatus: 'cancelled',
        },
      },
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
