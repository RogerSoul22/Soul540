import { Button } from '../../../../../packages/pentagono/src/index';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../routes';
import styles from './styles/Sidebar.module.scss';
import { navGroups } from './sidebar-navigation';

type SidebarProps = { collapsed: boolean; onToggle: () => void };

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, permissions } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
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
      <div className={styles.logoWrap}>
        <img src="/logo.png" alt="Soul540" className={styles.logoImg} />
      </div>
      <nav className={styles.nav}>
        {navGroups.map((group) => {
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
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Button
                    variant="nav"
                    key={item.path}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    onClick={() => (item.external ? (window.location.href = item.path) : navigate(item.path))}
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
          <div className={styles.avatar} onClick={() => navigate(ROUTES.USUARIO)} style={{ cursor: 'pointer' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className={styles.userDetails} onClick={() => navigate(ROUTES.USUARIO)} style={{ cursor: 'pointer' }}>
            <p className={styles.userName}>{user?.name || 'Usuário'}</p>
            <p className={styles.userRole}>{user?.role || 'admin'}</p>
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
  );
}
