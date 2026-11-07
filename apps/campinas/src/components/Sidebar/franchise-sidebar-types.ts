import type { ReactNode } from 'react';

export type SidebarNavigationItem = {
  external?: boolean;
  icon: ReactNode;
  label: string;
  path: string;
  permKey: string;
};

export type SidebarNavigationGroup = {
  items: SidebarNavigationItem[];
  label: string;
};
