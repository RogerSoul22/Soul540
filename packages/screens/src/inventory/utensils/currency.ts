export function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const numericValue = parseInt(digits, 10);
  const reais = Math.floor(numericValue / 100);
  const centavos = numericValue % 100;

  return `R$ ${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`;
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}
