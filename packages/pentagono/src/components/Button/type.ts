import type { ButtonHTMLAttributes, ReactNode } from 'react';

// Ações: primary, secondary, ghost, danger (têm tamanho md|sm|icon).
// Variações de uso: chip (filtro), tab (aba), nav (item de menu), outline (ação de lista ou
// navegação), dashed (adicionar item), link (ação textual). Elas trazem o próprio espaçamento.
export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'danger' | 'chip' | 'tab' | 'nav' | 'outline' | 'dashed' | 'link';
export type ButtonSize = 'md' | 'sm' | 'icon';

export const SIZED_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  // Estado selecionado de chip, tab, nav e outline.
  active?: boolean;
}
