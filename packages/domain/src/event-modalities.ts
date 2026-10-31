import type { EventModality } from '../../contracts/src/index';

export const EVENT_MODALITY_LABELS: Record<EventModality, string> = {
  feirinha: 'Feirinha',
  evento_avulso: 'Evento avulso',
};

export function normalizeEventModality(value: unknown): EventModality {
  return value === 'feirinha' ? 'feirinha' : 'evento_avulso';
}

export function getEventModalityLabel(value: unknown): string {
  return EVENT_MODALITY_LABELS[normalizeEventModality(value)];
}

export function getWeeklyOccurrenceDates(
  startDate: string,
  endDate: string | undefined,
  fromDate: string,
  limit: number,
): string[] {
  const start = parseDate(startDate);
  const from = parseDate(fromDate);
  const end = endDate ? parseDate(endDate) : undefined;
  if (!start || !from || (endDate && !end) || limit <= 0) return [];
  const firstOffset = Math.max(0, Math.ceil((from.getTime() - start.getTime()) / DAY_MS / 7));
  const first = addDays(start, firstOffset * 7);
  const dates: string[] = [];
  for (let current = first; dates.length < limit; current = addDays(current, 7)) {
    if (end && current > end) break;
    dates.push(toDateOnly(current));
  }
  return dates;
}

export function canConfirmWeeklyOccurrence(
  template: { modality?: EventModality; date: string; recurrenceEndDate?: string },
  occurrenceDate: string,
): boolean {
  if (normalizeEventModality(template.modality) !== 'feirinha') return false;
  const start = parseDate(template.date);
  const occurrence = parseDate(occurrenceDate);
  const end = template.recurrenceEndDate ? parseDate(template.recurrenceEndDate) : undefined;
  if (!start || !occurrence || (template.recurrenceEndDate && !end)) return false;
  const diffDays = Math.round((occurrence.getTime() - start.getTime()) / DAY_MS);
  return diffDays >= 0 && diffDays % 7 === 0 && (!end || occurrence <= end);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
