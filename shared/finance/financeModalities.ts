import { getEventModalityLabel, normalizeEventModality } from '@soul540/domain';
import type { EventModality, FinanceEntry } from '@soul540/contracts';

export type FinanceModalityFilter = 'all' | EventModality;

export function filterFinanceByModality(entries: FinanceEntry[], filter: FinanceModalityFilter) {
  if (filter === 'all') return entries;
  return entries.filter((entry) => normalizeEventModality(entry.modality) === filter);
}

export function getFinanceModalityLabel(value?: string) {
  return getEventModalityLabel(value);
}
