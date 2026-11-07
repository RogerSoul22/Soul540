import type { FinanceAppState } from '../types/finance-controller-types';

type Event = FinanceAppState['events'][number];

export function buildFranchiseFinanceFinalValues(periodEvents: Event[]) {
  const eventsWithFinalValue = periodEvents
    .filter((event) => (event.finalValue ?? 0) > 0)
    .sort((left, right) => right.date.localeCompare(left.date));
  return {
    eventsWithFinalValue,
    totalFinalValue: eventsWithFinalValue.reduce((sum, event) => sum + (event.finalValue || 0), 0),
  };
}
