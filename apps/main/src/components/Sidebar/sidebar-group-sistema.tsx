import { ROUTES } from '../../routes';
import { sidebarSystemPath0 } from './sidebar-icon-paths';
import type { NavGroup } from './sidebar-navigation-types';

export const sidebarGroupSistema: NavGroup = {
  label: 'Sistema',
  items: [
    {
      path: ROUTES.CHAT,
      permKey: 'chat',
      label: 'Chat IA',
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
          <path d={sidebarSystemPath0} />
          <circle cx="8.5" cy="13.5" r="1.5" />
          <circle cx="15.5" cy="13.5" r="1.5" />
        </svg>
      ),
    },
    {
      path: ROUTES.USUARIO,
      permKey: 'usuario',
      label: 'Minha Conta',
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
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      path: ROUTES.PERMISSOES,
      permKey: '__admin__',
      label: 'Permissões',
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
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      path: ROUTES.AUDITORIA,
      permKey: '__admin__',
      label: 'Auditoria',
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      path: ROUTES.CONFIGURACAO_FISCAL,
      permKey: '__admin__',
      label: 'Configuração fiscal',
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
          <path d="M12 3v18M3 12h18" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
  ],
};
