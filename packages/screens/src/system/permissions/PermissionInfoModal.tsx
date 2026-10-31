import { PermissionModal } from './PermissionModals';
import type { StyleMap } from './permission-types';

export default function PermissionInfoModal({ onClose, styles }: { onClose: () => void; styles: StyleMap }) {
  return (
    <PermissionModal styles={styles} title="Sobre esta página" onClose={onClose}>
      <div className={styles.infoSection}>
        <p className={styles.infoSectionTitle}>Permissões</p>
        <p className={styles.infoText}>
          Crie e gerencie usuários do sistema, definindo quais páginas cada um pode acessar.
        </p>
      </div>
      <div className={styles.infoSection}>
        <p className={styles.infoSectionTitle}>Controle de acesso</p>
        <p className={styles.infoText}>Administradores têm acesso automático a todas as páginas.</p>
      </div>
    </PermissionModal>
  );
}
