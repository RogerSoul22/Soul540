import type { ReactNode } from 'react';

export type NavItem = {
  path: string;
  permKey: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};
