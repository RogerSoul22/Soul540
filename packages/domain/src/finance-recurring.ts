export type FinanceRecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const amount = Number.parseInt(digits, 10);
  return `R$ ${Math.floor(amount / 100).toLocaleString('pt-BR')},${String(amount % 100).padStart(2, '0')}`;
}

export function parseCurrencyInput(value: string) {
  return Number(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

export function advanceFinanceRecurrence(date: string, frequency: FinanceRecurrenceFrequency, interval: number) {
  if (frequency === 'daily') return addDays(date, interval);
  if (frequency === 'weekly') return addDays(date, interval * 7);
  return addMonths(date, frequency === 'yearly' ? interval * 12 : interval);
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day + days).toISOString().slice(0, 10);
}

function addMonths(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number);
  const targetMonth = month - 1 + months;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  const yearPart = String(targetYear).padStart(4, '0');
  const monthPart = String(normalizedMonth + 1).padStart(2, '0');
  const dayPart = String(Math.min(day, lastDay)).padStart(2, '0');
  return `${yearPart}-${monthPart}-${dayPart}`;
}
