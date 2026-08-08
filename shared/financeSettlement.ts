import type { FinanceEntry } from './types';
import { calculateSettlementStatus } from './financePolicy';

/** Receita já liquidada (recebida no caixa ou sinal de evento). */
export function isRealizedRevenue(entry: FinanceEntry): boolean {
  if (entry.type !== 'revenue') return false;
  return calculateSettlementStatus(entry) === 'settled';
}

/** Despesa já paga. */
export function isRealizedExpense(entry: FinanceEntry): boolean {
  if (entry.type !== 'cost') return false;
  return calculateSettlementStatus(entry) === 'settled';
}

export function sumRealizedRevenue(entries: FinanceEntry[]): number {
  return entries.filter(isRealizedRevenue).reduce((sum, entry) => sum + entry.amount, 0);
}

export function sumRealizedExpense(entries: FinanceEntry[]): number {
  return entries.filter(isRealizedExpense).reduce((sum, entry) => sum + entry.amount, 0);
}
