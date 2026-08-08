import { getSaoPauloDate, isDateOnly } from './financeDates';

export type CanonicalSettlementStatus = 'open' | 'partial' | 'settled' | 'cancelled';

export interface FinanceSettlement {
  id: string;
  amountCents: number;
  externalId?: string;
  settledOn: string;
  settledAt: string;
  paymentMethod?: string;
  settledBy?: string;
  reason?: string;
  idempotencyKey: string;
}

export interface FinancePolicyEntry {
  type: 'revenue' | 'cost';
  amount: number;
  classificationStatus?: 'classified' | 'unclassified';
  amountCents?: number;
  date: string;
  status?: 'pending' | 'paid' | 'received';
  settlementStatus?: CanonicalSettlementStatus;
  settledAt?: string;
  reversedAt?: string;
  settlements?: FinanceSettlement[];
}

export function getFinanceAmountCents(entry: FinancePolicyEntry): number {
  if (Number.isSafeInteger(entry.amountCents)) return entry.amountCents as number;
  if (!Number.isFinite(entry.amount)) throw new Error('Valor monetário legado inválido');
  return Math.round(entry.amount * 100);
}

export function isCancelledFinance(entry: FinancePolicyEntry): boolean {
  return entry.settlementStatus === 'cancelled' || Boolean(entry.reversedAt);
}

export function isReportableInDre(entry: FinancePolicyEntry): boolean {
  return !isCancelledFinance(entry) && entry.classificationStatus !== 'unclassified';
}

export function getEffectiveSettlements(entry: FinancePolicyEntry): FinanceSettlement[] {
  if (Array.isArray(entry.settlements)) return entry.settlements;
  if (entry.settlementStatus !== 'settled' && entry.status !== 'paid' && entry.status !== 'received') return [];

  const settledOn = entry.settledAt ? getSaoPauloDate(entry.settledAt) : entry.date;
  return [{
    id: 'legacy-full-settlement',
    amountCents: getFinanceAmountCents(entry),
    settledOn: isDateOnly(settledOn) ? settledOn : entry.date,
    settledAt: entry.settledAt || `${entry.date}T12:00:00.000Z`,
    idempotencyKey: 'legacy-full-settlement',
  }];
}

export function getSettledCents(entry: FinancePolicyEntry): number {
  if (isCancelledFinance(entry)) return 0;
  return getEffectiveSettlements(entry).reduce((total, settlement) => total + settlement.amountCents, 0);
}

export function getOutstandingCents(entry: FinancePolicyEntry): number {
  return Math.max(getFinanceAmountCents(entry) - getSettledCents(entry), 0);
}

export function calculateSettlementStatus(entry: FinancePolicyEntry): CanonicalSettlementStatus {
  if (isCancelledFinance(entry)) return 'cancelled';
  const settledCents = getSettledCents(entry);
  if (settledCents <= 0) return 'open';
  return settledCents >= getFinanceAmountCents(entry) ? 'settled' : 'partial';
}

export function canChangeForecast(entry: FinancePolicyEntry): boolean {
  return calculateSettlementStatus(entry) === 'open' && getSettledCents(entry) === 0;
}

export function getDerivedFinanceLabel(entry: FinancePolicyEntry): string {
  const status = calculateSettlementStatus(entry);
  if (status === 'cancelled') return 'Cancelado';
  if (status === 'partial') return 'Parcial';
  if (status === 'settled') return entry.type === 'revenue' ? 'Recebido' : 'Pago';
  return 'Pendente';
}

export function getCashCentsForPeriod(entry: FinancePolicyEntry, start?: string, end?: string): number {
  if (isCancelledFinance(entry)) return 0;
  return getEffectiveSettlements(entry)
    .filter((settlement) => (!start || settlement.settledOn >= start) && (!end || settlement.settledOn <= end))
    .reduce((total, settlement) => total + settlement.amountCents, 0);
}
