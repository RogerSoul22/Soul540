import { useMemo } from 'react';
import type { FinanceEntry, PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { isRealizedRevenue } from '../../../../../../shared/finance/financeSettlement';
import type { FinancePeriod } from '../../../../../../shared/finance/financePeriod';
import { useFinanceDerivedMetrics } from './use-finance-derived-metrics';
import { useFinancePeriodCharts } from './use-finance-period-charts';
import { useFinanceFinalValueSummary } from './use-finance-final-value-summary';
import { useFinanceEventBudgetSummary } from './use-finance-event-budget-summary';
import { useFinancePeriodInsights } from './use-finance-period-insights';
import { normalizeEventModality } from '../../../../../../packages/domain/src/index';
import type { FinanceModalityFilter } from '../support/finance-modalities';
type FinancePeriodDerivationsInput = {
  activeFinances: FinanceEntry[];
  activeEvents: PizzaEvent[];
  financePeriod: FinancePeriod;
  filterType: 'all' | 'revenue' | 'cost' | 'pending';
  modalityFilter: FinanceModalityFilter;
  search: string;
  categoryLabels: Record<string, string>;
  categoryColors: Record<string, string>;
};
export function useFinancePeriodDerivations({
  activeFinances,
  activeEvents,
  financePeriod,
  filterType,
  modalityFilter,
  search,
  categoryLabels,
  categoryColors,
}: FinancePeriodDerivationsInput) {
  const modalityFinances = useMemo(
    () =>
      activeFinances.filter(
        (finance) => modalityFilter === 'all' || normalizeEventModality(finance.modality) === modalityFilter,
      ),
    [activeFinances, modalityFilter],
  );
  const modalityEvents = useMemo(
    () =>
      activeEvents.filter(
        (event) => modalityFilter === 'all' || normalizeEventModality(event.modality) === modalityFilter,
      ),
    [activeEvents, modalityFilter],
  );
  const {
    periodFinances,
    periodEvents,
    totalRevenue,
    totalCosts,
    profit,
    margin,
    realizedIncome,
    projectedIncome,
    realizedExpense,
    projectedExpense,
    expenseCategorySummary,
    revenueByEvent,
    revenueByOrigin,
    commissionSummary,
    wallet,
    walletBalance,
    bankWallet,
  } = useFinanceDerivedMetrics({ activeFinances: modalityFinances, activeEvents: modalityEvents, financePeriod });
  const faturamentoTotal = totalRevenue;
  const faturamentoRecebido = useMemo(
    () =>
      periodFinances.filter((f) => f.type === 'revenue' && isRealizedRevenue(f)).reduce((acc, f) => acc + f.amount, 0),
    [periodFinances],
  );
  const saldoEmAberto = faturamentoTotal - faturamentoRecebido;
  const { monthlyData, monthFinances, monthRevenue, monthCosts, monthProfit, monthMargin, fixedCosts, variableCosts } =
    useFinancePeriodCharts(periodFinances, categoryLabels, categoryColors);
  const insights = useFinancePeriodInsights({
    activeEvents,
    filterType,
    monthFinances,
    monthRevenue,
    periodFinances,
    search,
    totalRevenue,
  });
  const { eventsWithBudget, totalContracted, totalReceived } = useFinanceEventBudgetSummary(
    periodEvents,
    modalityFinances,
  );
  const { eventsWithFinalValue, totalFinalValue } = useFinanceFinalValueSummary(periodEvents);
  return {
    periodFinances,
    periodEvents,
    totalRevenue,
    totalCosts,
    profit,
    margin,
    realizedIncome,
    projectedIncome,
    realizedExpense,
    projectedExpense,
    expenseCategorySummary,
    revenueByEvent,
    revenueByOrigin,
    commissionSummary,
    wallet,
    walletBalance,
    bankWallet,
    faturamentoTotal,
    faturamentoRecebido,
    saldoEmAberto,
    ...insights,
    monthlyData,
    monthFinances,
    monthRevenue,
    monthCosts,
    monthProfit,
    monthMargin,
    fixedCosts,
    variableCosts,
    eventsWithBudget,
    totalContracted,
    totalReceived,
    eventsWithFinalValue,
    totalFinalValue,
  };
}
