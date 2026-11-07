import type { FinanceEntry } from '../types/finance-controller-types';

export function buildFranchiseFinanceCategoryTotals(
  finances: FinanceEntry[],
  allowed: readonly string[],
  labels: Record<string, string>,
  colors: Record<string, string>,
) {
  const totals: Record<string, number> = {};
  finances.forEach((finance) => {
    if (finance.type === 'cost' && allowed.includes(finance.category)) {
      totals[finance.category] = (totals[finance.category] || 0) + finance.amount;
    }
  });
  return Object.entries(totals).map(([category, value]) => ({
    label: labels[category] || category,
    value,
    color: colors[category] || '#64748b',
  }));
}
