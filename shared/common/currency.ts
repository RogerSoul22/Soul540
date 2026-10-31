/** Format a number as Brazilian Real currency. */
export function formatBRL(value: number): string {
  const cents = Math.round(Math.abs(value) * 100);
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const sign = value < 0 ? '-' : '';
  return `${sign}R$ ${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`;
}
