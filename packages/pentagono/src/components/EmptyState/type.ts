import type { ReactNode } from 'react';

// default: bloco centralizado de página; compact: dentro de lista ou card; inline: uma linha de texto.
export type EmptyStateVariant = 'default' | 'compact' | 'inline';

export interface EmptyStateProps {
  // Ilustração acima do título.
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  // Conteúdo extra abaixo da descrição (ex.: atalhos para limpar filtros).
  children?: ReactNode;
  variant?: EmptyStateVariant;
  className?: string;
}
