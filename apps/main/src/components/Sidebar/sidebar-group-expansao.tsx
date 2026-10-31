import { ROUTES } from '../../routes';
import type { NavGroup } from './sidebar-navigation-types';

export const sidebarGroupExpansao: NavGroup = {
  label: 'Expansão',
  items: [
    {
      path: ROUTES.FRANQUIAS,
      permKey: 'franquias',
      label: 'Franquias',
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
  ],
};
