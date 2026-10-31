import { toCents } from '../../../../../shared/finance/money';
import { buildSettlementRecord } from '../../infrastructure/services/financeCommands';
import { Finance, FranchiseFinance, FactoryFinance } from '../finance/finance.model';

export { findEventForRequest, getEventStoreForUnit, getEventUnitsForLookup } from './events.lookup';

type FinanceModel = typeof Finance;
async function upsertAutomaticEventFinance(
  FinanceModel: FinanceModel,
  event: any,
  source: string,
  kind: 'balance' | 'deposit' | 'travel',
  amount: number,
) {
  const eventId = event.id || event._id.toString();
  const franchiseFilter = source === 'franchise' ? { franchiseId: event.franchiseId } : {};
  const query = {
    ...franchiseFilter,
    eventId,
    kind,
    automatic: true,
    reversedAt: { $exists: false },
    settlementStatus: { $ne: 'cancelled' },
  };
  let existing = await FinanceModel.findOne(query);

  if (!existing && kind === 'balance') {
    existing = await FinanceModel.findOne({
      ...franchiseFilter,
      eventId,
      autoEventBudget: true,
      reversedAt: { $exists: false },
      settlementStatus: { $ne: 'cancelled' },
    });
  }

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
  const financeDate = isDeposit && event.depositDate ? event.depositDate : event.date;
  const amountCents = toCents(amount);
  const depositSettlement = isDeposit
    ? buildSettlementRecord(
        {
          amount,
          settledOn: financeDate,
          paymentMethod: event.paymentMethod,
          reason: 'Sinal informado no evento',
          idempotencyKey: `event-deposit:${eventId}`,
        },
        'system',
      )
    : undefined;
  const payload = {
    eventId,
    type: isTravel ? 'cost' : 'revenue',
    category: isDeposit ? 'sinal-evento' : isTravel ? 'deslocamento-evento' : 'contrato',
    description: `${isDeposit ? 'Sinal' : isTravel ? 'Deslocamento' : 'Saldo'} - ${event.name}`,
    amount,
    amountCents,
    date: financeDate,
    paymentMethod: event.paymentMethod || undefined,
    modality: event.modality === 'feirinha' ? 'feirinha' : 'evento_avulso',
    origin: 'event',
    kind,
    automatic: true,
    autoEventBudget: kind === 'balance',
    source,
    ...(source === 'franchise' && { franchiseId: event.franchiseId }),
    settledCents: isDeposit ? amountCents : 0,
    settlements: depositSettlement ? [depositSettlement] : [],
    reversedAt: undefined,
    settlementStatus: isDeposit ? 'settled' : amountChanged ? 'open' : existing?.settlementStatus || 'open',
    status: isDeposit ? 'paid' : amountChanged ? 'pending' : existing?.status || 'pending',
    settledAt: isDeposit ? depositSettlement?.settledAt : amountChanged ? undefined : existing?.settledAt,
  };

  if (existing) {
    await FinanceModel.findByIdAndUpdate(
      existing._id,
      amountChanged
        ? { $set: payload, $unset: isDeposit ? { dueDate: 1 } : { dueDate: 1, settledAt: 1 } }
        : { $set: payload, $unset: { dueDate: 1 } },
    );
  } else await FinanceModel.create(payload);

  const duplicates = await FinanceModel.find(query).sort({ createdAt: 1 });
  if (duplicates.length > 1) {
    await FinanceModel.updateMany(
      { _id: { $in: duplicates.slice(1).map((item) => item._id) } },
      {
        $set: {
          settlementStatus: 'cancelled',
          reversedAt: new Date().toISOString(),
          reversalReason: 'Previsão automática duplicada',
        },
      },
    );
  }
}

export async function syncEventFinances(event: any, FinanceModel: FinanceModel, source: string) {
  if (source === 'factory') return;
  if (event.status === 'cancelled') {
    const eventId = event.id || event._id.toString();
    const linkedEntries = await FinanceModel.find({
      ...(event.franchiseId && { franchiseId: event.franchiseId }),
      eventId,
      $or: [{ automatic: true }, { autoEventBudget: true }],
      settlementStatus: { $ne: 'cancelled' },
    }).lean();
    if (linkedEntries.length > 0) {
      await FinanceModel.deleteMany({ _id: { $in: linkedEntries.map((entry: any) => entry._id) } });
    }
    return { cancelledCount: linkedEntries.length, requiresDecision: false };
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
  return { cancelledCount: 0, requiresDecision: false };
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
