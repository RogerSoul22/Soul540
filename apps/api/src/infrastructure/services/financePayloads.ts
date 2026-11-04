import { randomUUID } from 'node:crypto';
import { isDateOnly, getSaoPauloDate } from '../../../../../shared/finance/financeDates';
import { type FinanceSettlement } from '../../../../../shared/finance/financePolicy';
import { toCents, fromCents } from '../../../../../shared/finance/money';

function normalizeModality(value: unknown): 'feirinha' | 'evento_avulso' {
  return value === 'feirinha' ? 'feirinha' : 'evento_avulso';
}

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
    eventId: typeof input.eventId === 'string' ? input.eventId.trim() : '',
    origin: 'manual',
    kind: 'manual',
    automatic: false,
    autoEventBudget: false,
    source,
    modality: normalizeModality(input.modality),
  };
}

export function buildBankImportPayload(transaction: OfxTransactionInput, options: BankImportOptions) {
  const amountCents = toCents(transaction.amount);
  const category = options.category?.trim() || 'nao-classificado';
  const settlement = buildSettlementRecord(
    {
      amount: transaction.amount,
      settledOn: transaction.date,
      paymentMethod: 'bank',
      reason: 'Movimento importado do extrato OFX',
      idempotencyKey: transaction.externalId,
      externalId: transaction.externalId,
    },
    options.settledBy,
    options.settledAt,
  );

  return {
    type: transaction.type,
    category,
    classificationStatus: getClassificationStatusForCategory(category),
    description: transaction.description,
    amount: transaction.amount,
    amountCents,
    date: transaction.date,
    paymentMethod: 'bank',
    status: 'paid',
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

  const externalId =
    typeof input.externalId === 'string' && input.externalId.trim() ? input.externalId.trim() : undefined;
  return {
    id,
    amountCents: toCents(input.amount),
    ...(externalId ? { externalId } : {}),
    settledOn,
    settledAt,
    paymentMethod:
      typeof input.paymentMethod === 'string' && input.paymentMethod.trim() ? input.paymentMethod.trim() : undefined,
    settledBy,
    reason: typeof input.reason === 'string' && input.reason.trim() ? input.reason.trim() : undefined,
    idempotencyKey: input.idempotencyKey.trim(),
  };
}
