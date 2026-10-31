import { randomUUID } from 'node:crypto';
import { isDateOnly, getSaoPauloDate } from '../../../../../shared/finance/financeDates';
import { type FinanceSettlement } from '../../../../../shared/finance/financePolicy';
import { toCents, fromCents } from '../../../../../shared/finance/money';

import { buildSettlementRecord } from './financePayloads';
export {
  buildBankImportPayload,
  buildManualFinancePayload,
  buildSettlementRecord,
  getClassificationStatusForCategory,
} from './financePayloads';

type FinanceStatusChangeCommand =
  { kind: 'settle'; settlement: FinanceSettlement } | { kind: 'reopen' } | { kind: 'noop' };

export function resolveFinanceStatusChange(
  entry: {
    type: 'revenue' | 'cost';
    date: string;
    amount: number;
    amountCents?: number;
    settledCents?: number;
    settlementStatus?: string;
    paymentMethod?: string;
  },
  targetStatus: 'pending' | 'paid',
  input: { settledOn?: string; paymentMethod?: string; reason?: string },
  settledBy: string,
): FinanceStatusChangeCommand {
  if (targetStatus !== 'pending' && targetStatus !== 'paid') {
    throw new Error('Status financeiro inválido');
  }

  const amountCents = Number.isSafeInteger(entry.amountCents) ? (entry.amountCents as number) : toCents(entry.amount);
  const settledCents = entry.settledCents ?? 0;
  const isCurrentlySettled = amountCents > 0 && settledCents >= amountCents;
  const wantsSettled = targetStatus === 'paid';

  if (wantsSettled) {
    if (isCurrentlySettled) return { kind: 'noop' };
    const openCents = amountCents - settledCents;
    const settlement = buildSettlementRecord(
      {
        amount: fromCents(openCents),
        settledOn: input.settledOn || entry.date,
        paymentMethod: input.paymentMethod || entry.paymentMethod,
        reason: input.reason || 'Alteração manual de status',
        idempotencyKey: randomUUID(),
      },
      settledBy,
    );
    return { kind: 'settle', settlement };
  }

  if (settledCents === 0) return { kind: 'noop' };
  return { kind: 'reopen' };
}
