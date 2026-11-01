import type { HTMLAttributes, ReactNode } from 'react';

// default: bloco com borda e sombra; stat: indicador (valor em destaque); flat: sem sombra, para
// listas; outlined: só a borda, para itens dentro de outro card.
export type CardVariant = 'default' | 'stat' | 'flat' | 'outlined';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: CardVariant;
  interactive?: boolean;
}
