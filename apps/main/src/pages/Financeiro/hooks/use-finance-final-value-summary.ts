import { useMemo } from 'react';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';

export function useFinanceFinalValueSummary(events: PizzaEvent[]) {
  const eventsWithFinalValue = useMemo(
    () =>
      events.filter((event) => (event.finalValue ?? 0) > 0).sort((left, right) => right.date.localeCompare(left.date)),
    [events],
  );
  const totalFinalValue = useMemo(
    () => eventsWithFinalValue.reduce((sum, event) => sum + (event.finalValue || 0), 0),
    [eventsWithFinalValue],
  );
  return { eventsWithFinalValue, totalFinalValue };
}
