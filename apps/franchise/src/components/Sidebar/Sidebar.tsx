import { Button } from '../../../../../packages/pentagono/src/index';
import { MobileNav } from '../../../../../packages/ui/src/index';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes';
import styles from './styles/Sidebar.module.scss';
import { franchiseSidebarGroups } from './franchise-sidebar-navigation';

// No servidor de desenvolvimento os arquivos públicos ficam sob o prefixo (base) do app.
const externalHref = (path: string) => (import.meta.env.DEV ? `${LOGO_BASE}${path.replace(/^\//, '')}` : path);
const LOGO_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;
const LOGO_SRC = `${LOGO_BASE}logo.png`;

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.isAdmin ?? false;
  const permissions = user?.permissions ?? [];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Mesmos itens da barra lateral, para o menu do celular (barra fixa embaixo + "Mais").
  const mobileItems = franchiseSidebarGroups
    .flatMap((group) => group.items)
    .filter((item) => {
      if (item.permKey === '__admin__') return isAdmin;
      if (isAdmin) return true;
      return item.permKey === 'dashboard' || permissions.includes(item.permKey);
    });

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <Button
          variant="nav"
          type="button"
          className={styles.collapseButton}
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-pressed={collapsed}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points={collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
          </svg>
        </Button>
        <div className={styles.logo}>
          <img src={LOGO_SRC} alt="Soul540" className={styles.logoImg} />
          <span className={styles.logoTag}>Itu</span>
        </div>
        <nav className={styles.nav}>
          {franchiseSidebarGroups.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (item.permKey === '__admin__') return isAdmin;
              if (isAdmin) return true;
              return item.permKey === 'dashboard' || permissions.includes(item.permKey);
            });
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className={styles.navGroup}>
                <span className={styles.navGroupLabel}>{group.label}</span>
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      variant="nav"
                      key={item.path}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                      onClick={() =>
                        'external' in item && item.external
                          ? (window.location.href = externalHref(item.path))
                          : navigate(item.path)
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && <span className={styles.activeIndicator} />}
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.name?.charAt(0) || 'F'}</div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userRole}>{user?.isAdmin ? 'Admin' : 'Franqueado'}</p>
            </div>
            <Button variant="ghost" size="sm" className={styles.logoutBtn} onClick={handleLogout} title="Sair">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </Button>
          </div>
        </div>
      </aside>
      <MobileNav
        items={mobileItems}
        primaryPaths={[ROUTES.DASHBOARD, ROUTES.EVENTOS, ROUTES.FINANCEIRO, '/portal.html']}
        activePath={location.pathname}
        userName={user?.name}
        onSelect={(item) => (item.external ? (window.location.href = externalHref(item.path)) : navigate(item.path))}
        onLogout={handleLogout}
      />
    </>
  );
}
