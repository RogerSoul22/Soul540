import { useMemo } from 'react';
import type { FinanceEntry, PizzaEvent } from '@soul540/contracts';
import { isRealizedRevenue } from '../../../../../../shared/finance/financeSettlement';
import { sumFinanceAmountsByCategory } from '../../../../../../shared/finance/financeSummary';

type FinancePeriodInsightsInput = {
  activeEvents: PizzaEvent[];
  filterType: 'all' | 'revenue' | 'cost' | 'pending';
  monthFinances: FinanceEntry[];
  monthRevenue: number;
  periodFinances: FinanceEntry[];
  search: string;
  totalRevenue: number;
};

export function useFinancePeriodInsights({
  activeEvents,
  filterType,
  monthFinances,
  monthRevenue,
  periodFinances,
  search,
  totalRevenue,
}: FinancePeriodInsightsInput) {
  const paymentMethodSummary = useMemo(() => {
    const grouped = new Map<string, { method: string; amount: number; count: number }>();
    for (const entry of periodFinances.filter(isRealizedRevenue)) {
      const method = entry.paymentMethod || 'nao-informado';
      const current = grouped.get(method) || { method, amount: 0, count: 0 };
      current.amount += entry.amount;
      current.count += 1;
      grouped.set(method, current);
    }
    return [...grouped.values()].sort((a, b) => b.amount - a.amount);
  }, [periodFinances]);

  const paymentMethodTotal = useMemo(
    () => paymentMethodSummary.reduce((sum, item) => sum + item.amount, 0),
    [paymentMethodSummary],
  );
  const insumos = sumFinanceAmountsByCategory(periodFinances, ['cmv', 'embalagens']);
  const monthlyInsumos = sumFinanceAmountsByCategory(monthFinances, ['cmv', 'embalagens']);
  const labor = periodFinances
    .filter((finance) => finance.type === 'cost' && ['salario', 'pro-labore'].includes(finance.category))
    .reduce((sum, finance) => sum + finance.amount, 0);
  const monthlyLabor = monthFinances
    .filter((finance) => finance.type === 'cost' && ['salario', 'pro-labore'].includes(finance.category))
    .reduce((sum, finance) => sum + finance.amount, 0);
  const insumosRatio = totalRevenue > 0 ? (insumos / totalRevenue) * 100 : 0;
  const maoObraRatio = totalRevenue > 0 ? (labor / totalRevenue) * 100 : 0;
  const insumosRatioMensal = monthRevenue > 0 ? (monthlyInsumos / monthRevenue) * 100 : 0;
  const maoObraRatioMensal = monthRevenue > 0 ? (monthlyLabor / monthRevenue) * 100 : 0;
  const filtered = useMemo(
    () =>
      periodFinances
        .filter((finance) => {
          if (!finance.date) return false;
          if (filterType === 'pending' && finance.status !== 'pending') return false;
          if (filterType !== 'all' && filterType !== 'pending' && finance.type !== filterType) return false;
          if (!search) return true;
          const query = search.toLowerCase();
          const event = activeEvents.find((item) => item.id === finance.eventId);
          return (
            finance.description.toLowerCase().includes(query) ||
            finance.category.toLowerCase().includes(query) ||
            event?.name.toLowerCase().includes(query)
          );
        })
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [periodFinances, filterType, search, activeEvents],
  );
  return {
    filtered,
    insumosRatio,
    maoObraRatio,
    insumosRatioMensal,
    maoObraRatioMensal,
    paymentMethodSummary,
    paymentMethodTotal,
  };
}
