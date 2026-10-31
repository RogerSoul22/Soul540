import { useMemo } from 'react';
import type { FactoryFinanceState } from './use-factory-finance-state';

type Props = Pick<FactoryFinanceState, 'events' | 'filterType' | 'search'> & {
  periodFinances: FactoryFinanceState['finances'];
};

export function useFactoryFinanceFilter({ events, periodFinances, filterType, search }: Props) {
  return useMemo(
    () =>
      periodFinances
        .filter((finance) => {
          if (!finance.date) return false;
          if (filterType === 'pending' && finance.status !== 'pending') return false;
          if (filterType !== 'all' && filterType !== 'pending' && finance.type !== filterType) return false;
          if (!search) return true;
          const query = search.toLowerCase();
          const event = events.find((item) => item.id === finance.eventId);
          return (
            finance.description.toLowerCase().includes(query) ||
            finance.category.toLowerCase().includes(query) ||
            event?.name.toLowerCase().includes(query)
          );
        })
        .sort((left, right) => (right.date || '').localeCompare(left.date || '')),
    [events, filterType, periodFinances, search],
  );
}
