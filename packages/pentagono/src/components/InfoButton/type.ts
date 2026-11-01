import type { ButtonHTMLAttributes } from 'react';

export interface InfoButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  // Texto de tooltip e de leitor de tela.
  label?: string;
  // Anel ao redor do ícone (usado em cabeçalhos de painel).
  bordered?: boolean;
}
