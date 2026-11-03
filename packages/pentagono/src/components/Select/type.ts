import type { SelectHTMLAttributes } from 'react';

// Sem label o campo é só o <select>: default (formulário), compact (filtro) e inline (célula de tabela).
export type SelectVariant = 'default' | 'compact' | 'inline';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  variant?: SelectVariant;
  searchable?: boolean;
}
