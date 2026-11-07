import { franchiseTitle } from '../../franchise-pwa';
import { getFranchiseSlug } from '../../franchise-path';
import { ROUTES } from '../../routes';
import type { SidebarNavigationGroup } from './franchise-sidebar-types';

export const franchisePortalGroup: SidebarNavigationGroup = {
  label: franchiseTitle(getFranchiseSlug()),
  items: [
    {
      path: '/portal.html',
      permKey: 'dashboard',
      label: 'Portal',
      external: true,
      icon: <span aria-hidden="true">▦</span>,
    },
    {
      path: ROUTES.DASHBOARD,
      permKey: 'dashboard',
      label: 'Dashboard',
      icon: <span aria-hidden="true">▦</span>,
    },
  ],
};
