import { useMemo } from 'react';
import type { FinanceEntry, PizzaEvent } from '@soul540/contracts';
import { isRealizedRevenue } from '../../../../../../shared/finance/financeSettlement';

export function useFinanceEventBudgetSummary(events: PizzaEvent[], finances: FinanceEntry[]) {
  const eventsWithBudget = useMemo(
    () =>
      events
        .filter((event) => event.budget > 0)
        .map((event) => ({
          event,
          finance: finances.find(
            (finance) => finance.eventId === event.id && finance.type === 'revenue' && finance.category === 'contrato',
          ),
        }))
        .sort((left, right) => right.event.date.localeCompare(left.event.date)),
    [events, finances],
  );
  const totalContracted = useMemo(
    () => eventsWithBudget.reduce((sum, item) => sum + item.event.budget, 0),
    [eventsWithBudget],
  );
  const totalReceived = useMemo(
    () =>
      eventsWithBudget
        .filter((item) => item.finance && isRealizedRevenue(item.finance))
        .reduce((sum, item) => sum + item.event.budget, 0),
    [eventsWithBudget],
  );
  return { eventsWithBudget, totalContracted, totalReceived };
}
