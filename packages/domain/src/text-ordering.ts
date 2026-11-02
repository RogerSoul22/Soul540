const portugueseTextCollator = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
});

// Aceita valores ausentes (evento sem local, por exemplo): a busca não pode quebrar a tela.
export function normalizeTextPtBr(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');
}

export function compareTextPtBr(first: string | null | undefined, second: string | null | undefined): number {
  return portugueseTextCollator.compare(normalizeTextPtBr(first), normalizeTextPtBr(second));
}
