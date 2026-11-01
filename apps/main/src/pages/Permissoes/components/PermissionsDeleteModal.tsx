import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { AppUser } from '../types/permissions-types';
import styles from '../styles/Permissoes.module.scss';

type Props = { target: AppUser; onClose: () => void; onDelete: () => void };

export default function PermissionsDeleteModal({ target, onClose, onDelete }: Props) {
  return (
    <Modal title="Remover usuário" onClose={onClose} closeOnOverlay maxWidth={440} flush>
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
    </Modal>
  );
}
