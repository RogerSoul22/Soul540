import { Button, Input, Select } from '@soul540/ui';
import type { UserForm } from '../types/permissions-types';
import styles from '../styles/Permissoes.module.scss';

type Props = {
  form: UserForm;
  onClose: () => void;
  onCreate: () => void;
  onFormChange: (form: UserForm) => void;
};

export default function PermissionsCreateModal({ form, onClose, onCreate, onFormChange }: Props) {
  const update = (field: keyof UserForm, value: string | boolean) => onFormChange({ ...form, [field]: value });
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Novo Usuário</h2>
          <Button type="button" variant="ghost" className={styles.modalClose} onClick={onClose}>
            X
          </Button>
        </div>
        <div className={styles.modalBody}>
          <Input
            label="Nome *"
            className={styles.input}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
          />
          <Input
            label="Email *"
            className={styles.input}
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
          />
          <Input
            label="Senha *"
            className={styles.input}
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            className={styles.checkboxLabel}
            aria-pressed={form.isAdmin}
            onClick={() => update('isAdmin', !form.isAdmin)}
          >
            Administrador (acesso total)
          </Button>
          <Select
            label="Sistema"
            className={styles.input}
            value={form.unit}
            onChange={(event) => update('unit', event.target.value)}
          >
            <option value="main">Principal</option>
            <option value="franchise">Itu</option>
            <option value="factory">Fábrica</option>
          </Select>
        </div>
        <div className={styles.modalFooter}>
          <Button type="button" variant="ghost" className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            className={styles.btnPrimary}
            onClick={onCreate}
            disabled={!form.name.trim() || !form.email.trim() || !form.password}
          >
            Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
}
