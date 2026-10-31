import { type ReactNode, useEffect, useState } from 'react';
import styles from './styles/PortalLayout.module.scss';

const defaultStorageKey = 'soul540-sidebar-collapsed';

interface SidebarRendererProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface PortalLayoutProps {
  children: ReactNode;
  feedback: ReactNode;
  renderSidebar: (props: SidebarRendererProps) => ReactNode;
  storageKey?: string;
}

export default function PortalLayout({
  children,
  feedback,
  renderSidebar,
  storageKey = defaultStorageKey,
}: PortalLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(storageKey) === 'true');

  useEffect(() => {
    localStorage.setItem(storageKey, String(sidebarCollapsed));
  }, [sidebarCollapsed, storageKey]);

  return (
    <div className={styles.layout}>
      {renderSidebar({
        collapsed: sidebarCollapsed,
        onToggle: () => setSidebarCollapsed((current) => !current),
      })}
      {feedback}
      <main className={`${styles.main} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}>{children}</main>
    </div>
  );
}
