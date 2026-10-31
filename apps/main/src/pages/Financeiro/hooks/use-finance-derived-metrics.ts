import { useMemo } from 'react';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import type { FinanceEntry } from '../../../../../../packages/contracts/src/index';
import { isRealizedExpense, isRealizedRevenue } from '../../../../../../shared/finance/financeSettlement';
import type { FinancePeriod } from '../../../../../../shared/finance/financePeriod';
import { matchesFinancePeriod } from '../../../../../../shared/finance/financePeriod';

type FinanceDerivedMetricsInput = {
  activeFinances: FinanceEntry[];
  activeEvents: PizzaEvent[];
  financePeriod: FinancePeriod;
};

export function useFinanceDerivedMetrics({ activeFinances, activeEvents, financePeriod }: FinanceDerivedMetricsInput) {
  const periodFinances = useMemo(
    () => activeFinances.filter((finance) => matchesFinancePeriod(finance.date, financePeriod)),
    [activeFinances, financePeriod],
  );
  const periodEvents = useMemo(
    () => activeEvents.filter((event) => matchesFinancePeriod(event.date, financePeriod)),
    [activeEvents, financePeriod],
  );

  const totalRevenue = useMemo(
    () => periodFinances.filter((f) => f.type === 'revenue').reduce((acc, f) => acc + f.amount, 0),
    [periodFinances],
  );
  const totalCosts = useMemo(
    () => periodFinances.filter((f) => f.type === 'cost').reduce((acc, f) => acc + f.amount, 0),
    [periodFinances],
  );
  const profit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const realizedIncome = useMemo(
    () =>
      periodFinances
        .filter((entry) => entry.type === 'revenue' && isRealizedRevenue(entry))
        .reduce((sum, entry) => sum + entry.amount, 0),
    [periodFinances],
  );
  const projectedIncome = totalRevenue - realizedIncome;
  const realizedExpense = useMemo(
    () => periodFinances.filter(isRealizedExpense).reduce((sum, entry) => sum + entry.amount, 0),
    [periodFinances],
  );
  const projectedExpense = totalCosts - realizedExpense;

  const expenseCategorySummary = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const entry of periodFinances.filter((item) => item.type === 'cost')) {
      grouped.set(entry.category, (grouped.get(entry.category) || 0) + entry.amount);
    }
    return [...grouped.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodFinances]);

  const revenueByEvent = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const entry of periodFinances.filter((item) => item.type === 'revenue' && item.eventId)) {
      grouped.set(entry.eventId, (grouped.get(entry.eventId) || 0) + entry.amount);
    }
    return [...grouped.entries()]
      .map(([eventId, amount]) => ({
        eventId,
        name: activeEvents.find((event) => event.id === eventId)?.name || 'Evento sem nome',
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodFinances, activeEvents]);

  const revenueByOrigin = useMemo(() => {
    const grouped = new Map<string, { amount: number; count: number }>();
    for (const entry of periodFinances.filter((item) => item.type === 'revenue')) {
      const origin = entry.origin || 'manual';
      const current = grouped.get(origin) || { amount: 0, count: 0 };
      current.amount += entry.amount;
      current.count += 1;
      grouped.set(origin, current);
    }
    return [...grouped.entries()]
      .map(([origin, values]) => ({ origin, ...values }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodFinances]);

  const commissionSummary = useMemo(
    () =>
      periodFinances
        .filter((entry) => entry.type === 'cost' && entry.kind === 'commission')
        .sort((a, b) => b.amount - a.amount),
    [periodFinances],
  );

  const wallet = useMemo(() => {
    const received = periodFinances
      .filter((f) => f.type === 'revenue' && isRealizedRevenue(f))
      .reduce((acc, f) => acc + f.amount, 0);
    const paid = periodFinances.filter(isRealizedExpense).reduce((acc, f) => acc + f.amount, 0);
    return { received, paid, balance: received - paid };
  }, [periodFinances]);
  const walletBalance = wallet.balance;
  const bankWallet = useMemo(() => {
    const latestByAccount = new Map<string, { date: string; balance: number }>();
    for (const entry of periodFinances) {
      if (entry.origin !== 'bank_import' || !entry.bankAccount || !Number.isFinite(entry.bankStatementBalance))
        continue;
      const marker = entry.settledAt || entry.date;
      const current = latestByAccount.get(entry.bankAccount);
      if (!current || marker > current.date)
        latestByAccount.set(entry.bankAccount, {
          date: marker,
          balance: entry.bankStatementBalance!,
        });
    }
    return {
      accounts: [...latestByAccount.entries()],
      balance: [...latestByAccount.values()].reduce((sum, account) => sum + account.balance, 0),
    };
  }, [periodFinances]);

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
  };
}
