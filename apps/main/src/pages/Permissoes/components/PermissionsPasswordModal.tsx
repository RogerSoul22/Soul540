import { Button, Input, Modal } from '../../../../../../packages/pentagono/src/index';
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
    <Modal title="Alterar Senha" onClose={onClose} closeOnOverlay maxWidth={440} flush>
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
    </Modal>
  );
}
