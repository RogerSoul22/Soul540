import { getEventModalityLabel, getWeeklyOccurrenceDates } from '../../../../../../packages/domain/src/index';
import type { PizzaEvent } from '../../../../../../shared/contracts/types';

type RecurringFeirinha = Pick<PizzaEvent, 'modality' | 'date' | 'recurrenceEndDate'>;

export function getModalityLabel(value: unknown): string {
  return getEventModalityLabel(value);
}

export function getUpcomingFeirinhaOccurrences(event: RecurringFeirinha, fromDate: string, limit: number): string[] {
  if (event.modality !== 'feirinha') return [];
  return getWeeklyOccurrenceDates(event.date, event.recurrenceEndDate, fromDate, limit);
}
