import { getSaoPauloDate, isDateOnly } from './financeDates';

export type FinancePeriodPreset =
  | 'this_week'
  | 'this_month'
  | 'this_year'
  | 'last_30_days'
  | 'last_12_months'
  | 'all_time'
  | 'custom';

export interface FinancePeriod {
  preset: FinancePeriodPreset;
  start: string;
  end: string;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

function addMonths(value: string, months: number): string {
  const date = parseDate(value);
  const originalDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(originalDay, lastDay));
  return formatDate(date);
}

function addYears(value: string, years: number): string {
  return addMonths(value, years * 12);
}

function isYearMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function startOfWeek(value: string): string {
  const day = parseDate(value).getUTCDay();
  return addDays(value, day === 0 ? -6 : 1 - day);
}

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function getFinancePeriodForPreset(preset: FinancePeriodPreset, today = getSaoPauloDate()): FinancePeriod {
  if (!isDateOnly(today)) throw new Error('Data de referência inválida');

  switch (preset) {
    case 'this_week':
      return { preset, start: startOfWeek(today), end: today };
    case 'this_month':
      return { preset, start: `${today.slice(0, 7)}-01`, end: today };
    case 'this_year':
      return { preset, start: `${today.slice(0, 4)}-01-01`, end: today };
    case 'last_30_days':
      return { preset, start: addDays(today, -29), end: today };
    case 'last_12_months':
      return { preset, start: addMonths(today, -12), end: today };
    case 'all_time':
      return { preset, start: '', end: '' };
    case 'custom':
      return { preset, start: today, end: today };
  }
}

export function getInitialFinancePeriod(today = getSaoPauloDate()): FinancePeriod {
  return getFinancePeriodForPreset('this_month', today);
}

export function createMonthRangePeriod(startMonth: string, endMonth: string): FinancePeriod {
  if (!isYearMonth(startMonth) || !isYearMonth(endMonth) || startMonth > endMonth) {
    throw new Error('Intervalo mensal invÃ¡lido');
  }

  const endMonthStart = `${endMonth}-01`;
  return {
    preset: 'custom',
    start: `${startMonth}-01`,
    end: addDays(addMonths(endMonthStart, 1), -1),
  };
}

export function matchesFinancePeriod(date: string | undefined | null, period: FinancePeriod): boolean {
  return Boolean(
    date
    && isDateOnly(date)
    && (!period.start || date >= period.start)
    && (!period.end || date <= period.end),
  );
}

export function getShiftedFinancePeriod(period: FinancePeriod, direction: -1 | 1): FinancePeriod {
  if (period.preset === 'all_time' || !isDateOnly(period.start) || !isDateOnly(period.end)) return period;

  if (period.preset === 'this_week') {
    return { ...period, start: addDays(period.start, direction * 7), end: addDays(period.end, direction * 7) };
  }
  if (period.preset === 'this_month') {
    return { ...period, start: addMonths(period.start, direction), end: addMonths(period.end, direction) };
  }
  if (period.preset === 'this_year') {
    return { ...period, start: addYears(period.start, direction), end: addYears(period.end, direction) };
  }

  const inclusiveDays = Math.round((parseDate(period.end).getTime() - parseDate(period.start).getTime()) / 86_400_000) + 1;
  return {
    ...period,
    start: addDays(period.start, direction * inclusiveDays),
    end: addDays(period.end, direction * inclusiveDays),
  };
}

export function formatFinancePeriodLabel(period: FinancePeriod): string {
  if (!period.start && !period.end) return 'Todo o período';
  if (!isDateOnly(period.start) || !isDateOnly(period.end)) return 'Período inválido';
  return `${formatDateLabel(period.start)} até ${formatDateLabel(period.end)}`;
}
