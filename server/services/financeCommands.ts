import { randomUUID } from 'node:crypto';
import { isDateOnly, getSaoPauloDate } from '../../shared/financeDates';
import { type FinanceSettlement } from '../../shared/financePolicy';
import { toCents, fromCents } from '../../shared/money';

type FinanceUnit = 'main' | 'franchise' | 'factory';

type OfxTransactionInput = {
  externalId: string;
  type: 'revenue' | 'cost';
  amount: number;
  date: string;
  description: string;
};

type BankImportOptions = {
  source: FinanceUnit;
  bankAccount: string;
  category?: string;
  bankStatementBalance?: number;
  importBatchId: string;
  settledBy: string;
  settledAt?: string;
};

export function getClassificationStatusForCategory(category: string): 'classified' | 'unclassified' {
  return category === 'nao-classificado' ? 'unclassified' : 'classified';
}

export function buildManualFinancePayload(input: Record<string, any>, source: FinanceUnit) {
  return {
    type: input.type,
    category: input.category,
    description: input.description || '',
    amount: input.amount,
    amountCents: toCents(input.amount),
    date: input.date,
    dueDate: input.dueDate,
    paymentMethod: input.paymentMethod,
    installmentGroupId: input.installmentGroupId,
    installmentNumber: input.installmentNumber,
    installmentTotal: input.installmentTotal,
    recurrenceId: input.recurrenceId,
    recurrenceFrequency: input.recurrenceFrequency,
    recurrenceEndDate: input.recurrenceEndDate,
    recurrenceInterval: input.recurrenceInterval,
    recurrenceTotal: input.recurrenceTotal,
    status: 'pending',
    settlementStatus: 'open',
    settledCents: 0,
    settlements: [],
    eventId: '',
    origin: 'manual',
    kind: 'manual',
    automatic: false,
    autoEventBudget: false,
    source,
  };
}

export function buildBankImportPayload(transaction: OfxTransactionInput, options: BankImportOptions) {
  const amountCents = toCents(transaction.amount);
  const category = options.category?.trim() || 'nao-classificado';
  const settlement = buildSettlementRecord({
    amount: transaction.amount,
    settledOn: transaction.date,
    paymentMethod: 'bank',
    reason: 'Movimento importado do extrato OFX',
    idempotencyKey: transaction.externalId,
    externalId: transaction.externalId,
  }, options.settledBy, options.settledAt);

  return {
    type: transaction.type,
    category,
    classificationStatus: getClassificationStatusForCategory(category),
    description: transaction.description,
    amount: transaction.amount,
    amountCents,
    date: transaction.date,
    paymentMethod: 'bank',
    status: transaction.type === 'revenue' ? 'received' : 'paid',
    settlementStatus: 'settled',
    settledCents: amountCents,
    settledAt: settlement.settledAt,
    settlements: [settlement],
    eventId: '',
    origin: 'bank_import',
    kind: 'manual',
    automatic: false,
    autoEventBudget: false,
    source: options.source,
    externalId: transaction.externalId,
    importBatchId: options.importBatchId,
    bankAccount: options.bankAccount,
    bankStatementBalance: options.bankStatementBalance,
  };
}

export function buildSettlementRecord(
  input: Record<string, any>,
  settledBy: string,
  settledAt = new Date().toISOString(),
  id: string = randomUUID(),
): FinanceSettlement {
  const settledOn = input.settledOn || getSaoPauloDate(settledAt);
  if (!isDateOnly(settledOn)) throw new Error('Data efetiva inválida');
  if (typeof input.idempotencyKey !== 'string' || input.idempotencyKey.trim().length < 8) {
    throw new Error('Chave de idempotência inválida');
  }

  const externalId = typeof input.externalId === 'string' && input.externalId.trim() ? input.externalId.trim() : undefined;
  return {
    id,
    amountCents: toCents(input.amount),
    ...(externalId ? { externalId } : {}),
    settledOn,
    settledAt,
    paymentMethod: typeof input.paymentMethod === 'string' && input.paymentMethod.trim() ? input.paymentMethod.trim() : undefined,
    settledBy,
    reason: typeof input.reason === 'string' && input.reason.trim() ? input.reason.trim() : undefined,
    idempotencyKey: input.idempotencyKey.trim(),
  };
}

type FinanceStatusChangeCommand =
  | { kind: 'settle'; settlement: FinanceSettlement }
  | { kind: 'reopen' }
  | { kind: 'noop' };

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
  targetStatus: 'pending' | 'paid' | 'received',
  input: { settledOn?: string; paymentMethod?: string; reason?: string },
  settledBy: string,
): FinanceStatusChangeCommand {
  if (entry.settlementStatus === 'cancelled') {
    throw new Error('Não é possível alterar o status de um lançamento cancelado');
  }

  const amountCents = Number.isSafeInteger(entry.amountCents) ? (entry.amountCents as number) : toCents(entry.amount);
  const settledCents = entry.settledCents ?? 0;
  const isCurrentlySettled = amountCents > 0 && settledCents >= amountCents;
  const wantsSettled = targetStatus === 'paid' || targetStatus === 'received';

  if (wantsSettled) {
    if (isCurrentlySettled) return { kind: 'noop' };
    const openCents = amountCents - settledCents;
    const settlement = buildSettlementRecord({
      amount: fromCents(openCents),
      settledOn: input.settledOn || entry.date,
      paymentMethod: input.paymentMethod || entry.paymentMethod,
      reason: input.reason || 'Alteração manual de status',
      idempotencyKey: randomUUID(),
    }, settledBy);
    return { kind: 'settle', settlement };
  }

  if (settledCents === 0) return { kind: 'noop' };
  return { kind: 'reopen' };
}
