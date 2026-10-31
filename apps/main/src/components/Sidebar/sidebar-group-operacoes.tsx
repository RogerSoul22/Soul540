import { ROUTES } from '../../routes';
import { sidebarOperationsPath0, sidebarOperationsPath1 } from './sidebar-icon-paths';
import type { NavGroup } from './sidebar-navigation-types';

export const sidebarGroupOperacoes: NavGroup = {
  label: 'Operações',
  items: [
    {
      path: ROUTES.CARDAPIOS,
      permKey: 'cardapios',
      label: 'Cardápios',
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
          <path d="M3 2.69a.5.5 0 0 1 .765-.424L21 12 3.765 21.734A.5.5 0 0 1 3 21.31V2.69z" />
        </svg>
      ),
    },
    {
      path: ROUTES.ESTOQUE_INSUMOS,
      permKey: 'estoque-insumos',
      label: 'Est. Insumos',
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
          <path d={sidebarOperationsPath0} />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      path: ROUTES.ESTOQUE_UTENSILIOS,
      permKey: 'estoque-utensilios',
      label: 'Est. Utensílios',
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
          <path d={sidebarOperationsPath1} />
        </svg>
      ),
    },
  ],
};
