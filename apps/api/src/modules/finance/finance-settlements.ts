import { buildSettlementRecord } from '../../infrastructure/services/financeCommands';
import { buildOfxSuggestions, type OfxTransaction } from '../../infrastructure/services/ofx';
import {
  calculateSettlementStatus,
  getEffectiveSettlements,
  getFinanceAmountCents,
  getSettledCents,
} from '../../../../../shared/finance/financePolicy';

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
    status: settlementStatus === 'settled' ? 'paid' : 'pending',
  };
}
export async function appendSettlementToFinance(model: any, document: any, settlement: any) {
  let entry = document?.toJSON ? document.toJSON() : document;
  const existing = Array.isArray(entry.settlements)
    ? entry.settlements.find(
        (item: any) =>
          item.idempotencyKey === settlement.idempotencyKey ||
          (settlement.externalId && item.externalId === settlement.externalId),
      )
    : undefined;
  if (existing) return { kind: 'duplicate' as const, finance: document };
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
    'settlements.idempotencyKey': { $ne: settlement.idempotencyKey },
    $expr: {
      $lte: [{ $add: [{ $ifNull: ['$settledCents', 0] }, settlement.amountCents] }, '$amountCents'],
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
          status: { $cond: [{ $gte: ['$settledCents', '$amountCents'] }, 'paid', 'pending'] },
        },
      },
    ],
    { new: true },
  );
  if (updated) return { kind: 'created' as const, finance: updated };

  const latest = await model.findById(entry._id);
  const duplicated = latest
    ?.toJSON?.()
    .settlements?.some(
      (item: any) =>
        item.idempotencyKey === settlement.idempotencyKey ||
        (settlement.externalId && item.externalId === settlement.externalId),
    );
  if (duplicated) return { kind: 'duplicate' as const, finance: latest };
  return {
    kind: 'error' as const,
    status: 409,
    error: 'Não foi possível registrar a baixa; atualize e tente novamente',
  };
}

export async function linkOfxTransaction(
  model: any,
  transaction: OfxTransaction,
  financeId: string,
  settledBy: string,
  scopeFilter: Record<string, unknown> = {},
) {
  const document = await model.findOne({ ...scopeFilter, _id: financeId });
  if (!document) return { kind: 'error' as const, status: 404, error: 'Previsão financeira não encontrada' };
  const preview = buildOfxSuggestions([transaction], [document.toJSON()])[0];
  if (preview.decision === 'duplicate') return { kind: 'duplicate' as const, finance: document };
  if (preview.decision !== 'link' || preview.financeId !== financeId) {
    return { kind: 'error' as const, status: 409, error: 'A previsão não está mais disponível para esta conciliação' };
  }
  const settlement = buildSettlementRecord(
    {
      amount: transaction.amount,
      settledOn: transaction.date,
      paymentMethod: 'bank',
      reason: `Conciliado pelo extrato OFX: ${transaction.description}`,
      idempotencyKey: transaction.externalId,
      externalId: transaction.externalId,
    },
    settledBy,
  );
  return appendSettlementToFinance(model, document, settlement);
}
