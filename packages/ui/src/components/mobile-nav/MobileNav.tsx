import { useState, type ReactNode } from 'react';
import { Button, Modal } from '../../../../pentagono/src/index';
import styles from './styles/MobileNav.module.scss';
import { useMobileViewportInset } from './use-mobile-viewport-inset';

export interface MobileNavItem {
  path: string;
  label: string;
  icon: ReactNode;
  // Página fora do app (ex.: o portal), aberta com recarga da página.
  external?: boolean;
}

interface MobileNavProps {
  // Itens que o usuário pode ver (já filtrados por permissão).
  items: MobileNavItem[];
  // Os poucos atalhos que ficam sempre na barra; o resto vai para "Mais".
  primaryPaths: string[];
  activePath: string;
  userName?: string;
  onSelect: (item: MobileNavItem) => void;
  onLogout: () => void;
}

const isActive = (activePath: string, path: string) => activePath === path || activePath.startsWith(`${path}/`);

// Menu do celular (padrão do dVolt): barra fixa embaixo com os atalhos principais e um "Mais" que abre a lista
// completa, com o usuário e o botão de sair.
export default function MobileNav({ items, primaryPaths, activePath, userName, onSelect, onLogout }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  useMobileViewportInset();

  const primary = primaryPaths
    .map((path) => items.find((item) => item.path === path))
    .filter((item): item is MobileNavItem => Boolean(item));
  const more = items.filter((item) => !primary.includes(item));
  const moreActive = more.some((item) => isActive(activePath, item.path));

  return (
    <>
      <nav className={styles.bar} aria-label="Navegação mobile">
        {primary.map((item) => (
          <Button
            key={item.path}
            variant="nav"
            active={isActive(activePath, item.path)}
            className={`${styles.item} ${isActive(activePath, item.path) ? styles.itemActive : ''}`}
            onClick={() => onSelect(item)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Button>
        ))}
        <Button
          variant="nav"
          className={`${styles.item} ${moreActive ? styles.itemActive : ''}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span className={styles.icon}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="1.2" />
              <circle cx="12" cy="12" r="1.2" />
              <circle cx="19" cy="12" r="1.2" />
            </svg>
          </span>
          <span className={styles.label}>Mais</span>
        </Button>
      </nav>

      {open && (
        <Modal title="Mais opções" size="sm" closeOnOverlay onClose={() => setOpen(false)}>
          <nav className={styles.moreList} aria-label="Outras áreas">
            {more.map((item) => (
              <Button
                key={item.path}
                variant="nav"
                active={isActive(activePath, item.path)}
                className={styles.moreItem}
                onClick={() => {
                  setOpen(false);
                  onSelect(item);
                }}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
          <div className={styles.account}>
            {userName && <span className={styles.userName}>{userName}</span>}
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              Sair
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
