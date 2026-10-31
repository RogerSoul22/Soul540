import { Button, Input } from '../../../../../../packages/ui/src/index';
import type { AppUser } from '../types/permissions-types';
import styles from '../styles/Permissoes.module.scss';

type Props = {
  saving: boolean;
  target: AppUser;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function PermissionsPasswordModal({ saving, target, value, onChange, onClose, onSave }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Alterar Senha</h2>
          <Button type="button" variant="ghost" className={styles.modalClose} onClick={onClose}>
            X
          </Button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.deleteMsg}>
            Alterar senha de <strong>{target.name}</strong>
          </p>
          <Input
            label="Nova Senha *"
            className={styles.input}
            type="password"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoFocus
          />
        </div>
        <div className={styles.modalFooter}>
          <Button type="button" variant="ghost" className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className={styles.btnPrimary} onClick={onSave} disabled={value.length < 6 || saving}>
            {saving ? 'Salvando...' : 'Salvar Senha'}
          </Button>
        </div>
      </div>
    </div>
  );
}
