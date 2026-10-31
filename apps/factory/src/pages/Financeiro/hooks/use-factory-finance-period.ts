import { useMemo } from 'react';
import { isRealizedRevenue } from '../../../../../../shared/finance/financeSettlement';
import { sumFinanceAmountsByCategory } from '../../../../../../shared/finance/financeSummary';
import { FIXED_CATEGORIES, VARIABLE_CATEGORIES } from '../../../../../../shared/finance/financeCategories';
import { matchesFinancePeriod } from '../../../../../../shared/finance/financePeriod';
import type { FactoryFinanceState } from './use-factory-finance-state';
import { buildFactoryFinanceCategoryTotals } from '../support/finance-period-category-totals';
import { buildFactoryFinanceBudgetTotals } from '../support/finance-period-budget';
import { useFactoryFinanceFilter } from './use-factory-finance-filter';
type Props = Pick<FactoryFinanceState, 'events' | 'finances' | 'financePeriod' | 'filterType' | 'search'> & {
  categoryLabels: Record<string, string>;
  categoryColors: Record<string, string>;
};

export function useFactoryFinancePeriod({
  events,
  finances,
  financePeriod,
  filterType,
  search,
  categoryLabels,
  categoryColors,
}: Props) {
  const periodFinances = useMemo(
    () => finances.filter((finance) => matchesFinancePeriod(finance.date, financePeriod)),
    [finances, financePeriod],
  );
  const periodEvents = useMemo(
    () => events.filter((event) => matchesFinancePeriod(event.date, financePeriod)),
    [events, financePeriod],
  );
  const totalRevenue = useMemo(
    () =>
      periodFinances.filter((finance) => finance.type === 'revenue').reduce((sum, finance) => sum + finance.amount, 0),
    [periodFinances],
  );
  const totalCosts = useMemo(
    () => periodFinances.filter((finance) => finance.type === 'cost').reduce((sum, finance) => sum + finance.amount, 0),
    [periodFinances],
  );
  const profit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const walletBalance = useMemo(() => {
    const received = periodFinances.filter((finance) => finance.type === 'revenue' && isRealizedRevenue(finance));
    const paid = periodFinances.filter((finance) => finance.type === 'cost' && finance.status === 'paid');
    return (
      received.reduce((sum, finance) => sum + finance.amount, 0) -
      paid.reduce((sum, finance) => sum + finance.amount, 0)
    );
  }, [periodFinances]);
  const faturamentoTotal = totalRevenue;
  const faturamentoRecebido = useMemo(
    () => periodFinances.filter(isRealizedRevenue).reduce((sum, finance) => sum + finance.amount, 0),
    [periodFinances],
  );
  const saldoEmAberto = faturamentoTotal - faturamentoRecebido;
  const monthlyData = useMemo(() => {
    const months = new Map<string, { month: string; receita: number; despesa: number }>();
    periodFinances.forEach((finance) => {
      const month = finance.date.slice(0, 7);
      const current = months.get(month) || { month, receita: 0, despesa: 0 };
      if (finance.type === 'revenue') current.receita += finance.amount;
      else current.despesa += finance.amount;
      months.set(month, current);
    });
    return [...months.values()].sort((left, right) => left.month.localeCompare(right.month));
  }, [periodFinances]);
  const monthFinances = periodFinances;
  const monthRevenue = monthFinances
    .filter((finance) => finance.type === 'revenue')
    .reduce((sum, finance) => sum + finance.amount, 0);
  const monthCosts = monthFinances
    .filter((finance) => finance.type === 'cost')
    .reduce((sum, finance) => sum + finance.amount, 0);
  const monthProfit = monthRevenue - monthCosts;
  const monthMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;
  const fixedCosts = useMemo(
    () => buildFactoryFinanceCategoryTotals(monthFinances, FIXED_CATEGORIES, categoryLabels, categoryColors),
    [monthFinances, categoryLabels, categoryColors],
  );
  const variableCosts = useMemo(
    () => buildFactoryFinanceCategoryTotals(monthFinances, VARIABLE_CATEGORIES, categoryLabels, categoryColors),
    [monthFinances, categoryLabels, categoryColors],
  );
  const insumosRatio =
    totalRevenue > 0 ? (sumFinanceAmountsByCategory(periodFinances, ['cmv', 'embalagens']) / totalRevenue) * 100 : 0;
  const maoObraRatio =
    totalRevenue > 0
      ? (periodFinances
          .filter((finance) => finance.type === 'cost' && ['salario', 'pro-labore'].includes(finance.category))
          .reduce((sum, finance) => sum + finance.amount, 0) /
          totalRevenue) *
        100
      : 0;
  const insumosRatioMensal =
    monthRevenue > 0 ? (sumFinanceAmountsByCategory(monthFinances, ['cmv', 'embalagens']) / monthRevenue) * 100 : 0;
  const maoObraRatioMensal =
    monthRevenue > 0
      ? (monthFinances
          .filter((finance) => finance.type === 'cost' && ['salario', 'pro-labore'].includes(finance.category))
          .reduce((sum, finance) => sum + finance.amount, 0) /
          monthRevenue) *
        100
      : 0;
  const filtered = useFactoryFinanceFilter({
    events,
    periodFinances,
    filterType,
    search,
  });
  const budget = buildFactoryFinanceBudgetTotals(periodEvents, finances);
  return {
    periodFinances,
    periodEvents,
    totalRevenue,
    totalCosts,
    profit,
    margin,
    walletBalance,
    faturamentoTotal,
    faturamentoRecebido,
    saldoEmAberto,
    monthlyData,
    monthFinances,
    monthRevenue,
    monthCosts,
    monthProfit,
    monthMargin,
    fixedCosts,
    variableCosts,
    insumosRatio,
    maoObraRatio,
    insumosRatioMensal,
    maoObraRatioMensal,
    filtered,
    ...budget,
  };
}
