const portugueseTextCollator = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
});

export function normalizeTextPtBr(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');
}

export function compareTextPtBr(first: string, second: string): number {
  return portugueseTextCollator.compare(normalizeTextPtBr(first), normalizeTextPtBr(second));
}
