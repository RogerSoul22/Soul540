import type { InputHTMLAttributes, ReactNode } from 'react';

// Sem label o campo é só o <input>: default (formulário), search (busca/filtro), inline (célula de
// tabela) e file (seleção de arquivo). checkbox e radio ganham o estilo de escolha automaticamente.
export type InputVariant = 'default' | 'search' | 'inline' | 'file';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  variant?: InputVariant;
}
