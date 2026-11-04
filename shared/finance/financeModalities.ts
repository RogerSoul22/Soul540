import { normalizeEventModality } from '../../packages/domain/src/index';
import type { EventModality, FinanceEntry } from '../../packages/contracts/src/index';

export type FinanceModalityFilter = 'all' | EventModality;

export function filterFinanceByModality(entries: FinanceEntry[], filter: FinanceModalityFilter) {
  if (filter === 'all') return entries;
  return entries.filter((entry) => normalizeEventModality(entry.modality) === filter);
}

export function getFinanceModalityLabel(value?: string) {
  return normalizeEventModality(value) === 'feirinha' ? 'Feirinha' : 'Evento';
}
