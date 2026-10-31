import { useMemo } from 'react';
import type { FinanceEntry } from '@soul540/contracts';
import { FIXED_CATEGORIES, VARIABLE_CATEGORIES } from '../../../../../../shared/finance/financeCategories';

export function useFinancePeriodCharts(
  periodFinances: FinanceEntry[],
  categoryLabels: Record<string, string>,
  categoryColors: Record<string, string>,
) {
  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; receita: number; despesa: number }>();
    for (const finance of periodFinances) {
      if (!finance.date) continue;
      const month = finance.date.substring(0, 7);
      const current = map.get(month) || { month, receita: 0, despesa: 0 };
      current[finance.type === 'revenue' ? 'receita' : 'despesa'] += finance.amount;
      map.set(month, current);
    }
    return [...map.values()].sort((left, right) => left.month.localeCompare(right.month));
  }, [periodFinances]);
  const monthFinances = periodFinances;
  const monthRevenue = useMemo(
    () =>
      monthFinances.filter((finance) => finance.type === 'revenue').reduce((sum, finance) => sum + finance.amount, 0),
    [monthFinances],
  );
  const monthCosts = useMemo(
    () => monthFinances.filter((finance) => finance.type === 'cost').reduce((sum, finance) => sum + finance.amount, 0),
    [monthFinances],
  );
  const monthProfit = monthRevenue - monthCosts;
  const monthMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;
  const buildCosts = (categories: readonly string[]) =>
    Object.entries(
      monthFinances
        .filter((finance) => finance.type === 'cost' && categories.includes(finance.category))
        .reduce<Record<string, number>>(
          (totals, finance) => ({ ...totals, [finance.category]: (totals[finance.category] || 0) + finance.amount }),
          {},
        ),
    )
      .map(([category, value]) => ({
        label: categoryLabels[category] || category,
        value,
        color: categoryColors[category] || '#64748b',
      }))
      .sort((left, right) => right.value - left.value);
  const fixedCosts = useMemo(() => buildCosts(FIXED_CATEGORIES), [monthFinances, categoryLabels, categoryColors]);
  const variableCosts = useMemo(() => buildCosts(VARIABLE_CATEGORIES), [monthFinances, categoryLabels, categoryColors]);
  return { monthlyData, monthFinances, monthRevenue, monthCosts, monthProfit, monthMargin, fixedCosts, variableCosts };
}
