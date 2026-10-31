import { notifyFeedback } from '@soul540/api-client';
import { Button, Input } from '@soul540/ui';
import { useState, type Dispatch, type SetStateAction } from 'react';
import type { ApiFetch, AppUser, NewUserForm, StyleMap } from './permission-types';
import PermissionModal from './PermissionModal';

export { PermissionModal };

interface ModalProps {
  apiFetch: ApiFetch;
  allKeys: string[];
  configUnit: string;
  form: NewUserForm;
  onClose: () => void;
  setForm: Dispatch<SetStateAction<NewUserForm>>;
  setUsers: Dispatch<SetStateAction<AppUser[]>>;
  styles: StyleMap;
}

export function CreateUserModal(props: ModalProps) {
  const [saving, setSaving] = useState(false);
  const valid = Boolean(props.form.name.trim() && props.form.email.trim() && props.form.password);
  const createUser = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const response = await props.apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...props.form,
          unit: props.configUnit,
          permissions: props.form.isAdmin ? props.allKeys : [],
        }),
      });
      if (!response.ok) throw new Error('create-user');
      const user = await response.json();
      props.setUsers((users) => [...users, user]);
      props.onClose();
    } catch {
      notifyFeedback('Erro ao criar usuario. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <PermissionModal styles={props.styles} title="Novo Usuario" onClose={props.onClose}>
      <Input
        label="Nome *"
        className={props.styles.input}
        value={props.form.name}
        onChange={(event) => props.setForm((form) => ({ ...form, name: event.target.value }))}
      />
      <Input
        label="E-mail *"
        className={props.styles.input}
        type="email"
        value={props.form.email}
        onChange={(event) => props.setForm((form) => ({ ...form, email: event.target.value }))}
      />
      <Input
        label="Senha *"
        className={props.styles.input}
        type="password"
        value={props.form.password}
        onChange={(event) => props.setForm((form) => ({ ...form, password: event.target.value }))}
      />
      <Button
        type="button"
        variant="ghost"
        className={props.styles.checkboxLabel}
        aria-pressed={props.form.isAdmin}
        onClick={() => props.setForm((form) => ({ ...form, isAdmin: !form.isAdmin }))}
      >
        Administrador (acesso total)
      </Button>
      <Input
        label="Sistema"
        className={props.styles.input}
        disabled
        value={props.configUnit === 'franchise' ? 'Itu' : 'Fabrica'}
      />
      <footer className={props.styles.modalFooter}>
        <Button type="button" variant="ghost" className={props.styles.btnCancel} onClick={props.onClose}>
          Cancelar
        </Button>
        <Button type="button" className={props.styles.btnPrimary} disabled={!valid || saving} onClick={createUser}>
          {saving ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </footer>
    </PermissionModal>
  );
}

export function PasswordModal({
  apiFetch,
  onClose,
  setUsers,
  styles,
  user,
}: {
  apiFetch: ApiFetch;
  onClose: () => void;
  setUsers: Dispatch<SetStateAction<AppUser[]>>;
  styles: StyleMap;
  user: AppUser;
}) {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (password.length < 6) return;
    setSaving(true);
    try {
      const response = await apiFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error('password');
      const updated = await response.json();
      setUsers((users) => users.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      onClose();
    } catch {
      notifyFeedback('Erro ao alterar senha. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <PermissionModal styles={styles} title="Alterar senha" onClose={onClose}>
      <p className={styles.deleteMsg}>
        Alterar senha de <strong>{user.name}</strong>
      </p>
      <Input
        label="Nova senha *"
        autoFocus
        className={styles.input}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <footer className={styles.modalFooter}>
        <Button type="button" variant="ghost" className={styles.btnCancel} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" className={styles.btnPrimary} disabled={password.length < 6 || saving} onClick={save}>
          {saving ? 'Salvando...' : 'Salvar senha'}
        </Button>
      </footer>
    </PermissionModal>
  );
}

