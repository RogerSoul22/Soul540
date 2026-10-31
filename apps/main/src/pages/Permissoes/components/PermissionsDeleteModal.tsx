import { Button } from '../../../../../../packages/ui/src/index';
import type { AppUser } from '../types/permissions-types';
import styles from '../styles/Permissoes.module.scss';

type Props = { target: AppUser; onClose: () => void; onDelete: () => void };

export default function PermissionsDeleteModal({ target, onClose, onDelete }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Remover usuário</h2>
          <Button type="button" variant="ghost" className={styles.modalClose} onClick={onClose}>
            X
          </Button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.deleteMsg}>
            Tem certeza que deseja remover <strong>{target.name}</strong>? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <Button type="button" variant="ghost" className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="ghost" className={styles.btnDanger} onClick={onDelete}>
            Remover
          </Button>
        </div>
      </div>
    </div>
  );
}
