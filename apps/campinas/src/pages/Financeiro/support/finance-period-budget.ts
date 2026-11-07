import { isRealizedRevenue } from '../../../../../../shared/finance/financeSettlement';
import type { FinanceAppState } from '../types/finance-controller-types';

type Event = FinanceAppState['events'][number];
type Finance = FinanceAppState['finances'][number];

export function buildFranchiseFinanceBudgetTotals(periodEvents: Event[], finances: Finance[]) {
  const eventsWithBudget = periodEvents
    .filter((event) => event.budget > 0)
    .map((event) => ({
      event,
      finance: finances.find(
        (finance) => finance.eventId === event.id && finance.type === 'revenue' && finance.category === 'contrato',
      ),
    }))
    .sort((left, right) => right.event.date.localeCompare(left.event.date));
  return {
    eventsWithBudget,
    totalContracted: eventsWithBudget.reduce((sum, item) => sum + item.event.budget, 0),
    totalReceived: eventsWithBudget
      .filter((item) => item.finance && isRealizedRevenue(item.finance))
      .reduce((sum, item) => sum + item.event.budget, 0),
  };
}
