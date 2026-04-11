// Shared utility functions used across main, franchise, and factory apps

/**
 * Format a number as Brazilian Real currency.
 * e.g. 1234.56 → "R$ 1.234,56"
 */
export function formatBRL(value: number): string {
  const cents = Math.round(Math.abs(value) * 100);
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const sign = value < 0 ? '-' : '';
  return `${sign}R$ ${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`;
}

/**
 * Format an ISO date string as dd/MM/yyyy.
 * e.g. "2026-04-11" → "11/04/2026"
 */
export function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.substring(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Return initials from a full name (max 2 chars, uppercase).
 * e.g. "João Silva" → "JS"
 */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a phone number to WhatsApp-compatible digits only.
 */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
