export function toCents(value: number | string): number {
  const amount = typeof value === 'string' ? Number(value.trim().replace(',', '.')) : value;
  if (!Number.isFinite(amount)) throw new Error('Valor monetário inválido');

  const cents = Math.round(amount * 100);
  if (Math.abs(amount * 100 - cents) > 0.000001) {
    throw new Error('Valor monetário deve ter no máximo duas casas decimais');
  }
  return cents;
}

export function fromCents(cents: number): number {
  if (!Number.isSafeInteger(cents)) throw new Error('Centavos inválidos');
  return cents / 100;
}
