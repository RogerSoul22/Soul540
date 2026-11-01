import type { ReactNode } from 'react';

// default: título de tela; greeting: saudação do painel, com data acima e título em destaque.
export type PageHeaderVariant = 'default' | 'greeting';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  // Linha acima do título (ex.: data de hoje).
  eyebrow?: ReactNode;
  // Ao lado do título (ex.: botão "Como usar esta página").
  titleExtra?: ReactNode;
  // Aviso abaixo do subtítulo (ex.: restrição de edição).
  notice?: ReactNode;
  actions?: ReactNode;
  variant?: PageHeaderVariant;
  className?: string;
}
