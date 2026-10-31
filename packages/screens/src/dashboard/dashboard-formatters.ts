import { format, isValid, parseISO } from 'date-fns';

export function getDashboardGreeting(name?: string): string {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0] ?? '';
  const suffix = firstName ? `, ${firstName}` : '';
  if (hour < 12) return `Bom dia${suffix}`;
  if (hour < 18) return `Boa tarde${suffix}`;
  return `Boa noite${suffix}`;
}

export function parseDashboardEventDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function formatDashboardEventDate(value: string | undefined | null, pattern: string): string {
  const date = parseDashboardEventDate(value);
  return date ? format(date, pattern) : 'Sem data';
}
