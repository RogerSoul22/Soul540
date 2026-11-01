import type { HTMLAttributes, ReactNode } from 'react';

// page: título de página; display: título de marca (serifado, login e erro); section: bloco de tela.
export type HeadingVariant = 'page' | 'display' | 'section';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  level?: HeadingLevel;
  variant?: HeadingVariant;
}
