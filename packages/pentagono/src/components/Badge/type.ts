import type { ReactNode } from 'react';

export type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}
