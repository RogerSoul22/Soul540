import { notifyFeedback } from '../../../../api-client/src/index';
import { Button, InfoButton, PageHeader } from '../../../../pentagono/src/index';
import { useEffect, useMemo, useState } from 'react';
import PermissionAccessPanel from './PermissionAccessPanel';
import { CreateUserModal, PasswordModal } from './PermissionModals';
import PermissionInfoModal from './PermissionInfoModal';
import PermissionUserList from './PermissionUserList';
import {
  emptyNewUserForm,
  unitLabels,
  type ApiFetch,
  type AppUser,
  type AuthUser,
  type PermissionDirectoryConfig,
  type StyleMap,
} from './permission-types';

interface PermissionDirectoryScreenProps {
  apiFetch: ApiFetch;
  authUser: AuthUser | null;
  config: PermissionDirectoryConfig;
  styles: StyleMap;
}

export default function PermissionDirectoryScreen({
  apiFetch,
  authUser,
  config,
  styles,
}: PermissionDirectoryScreenProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [draftIsAdmin, setDraftIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [form, setForm] = useState(emptyNewUserForm);
  const [passwordUser, setPasswordUser] = useState<AppUser | null>(null);
  const [saving, setSaving] = useState(false);
  const allKeys = useMemo(() => config.groups.flatMap((group) => group.items.map((item) => item.key)), [config.groups]);
  const currentUnit = authUser?.unit ?? config.unit;

  useEffect(() => {
    apiFetch('/api/users')
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setUsers(data))
      .catch(() => undefined);
  }, [apiFetch]);

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, unitLabels[user.unit ?? config.unit] ?? ''].some((value) =>
      value.toLowerCase().includes(search.trim().toLowerCase()),
    ),
  );
  const readOnly = Boolean(selected?.unit && selected.unit !== currentUnit && selected.isAdmin);
  const selectUser = (user: AppUser) => {
    setSelected(user);
    setDraftPermissions([...(user.permissions ?? [])]);
    setDraftIsAdmin(user.isAdmin);
  };
  const togglePermission = (key: string) => {
    setDraftPermissions((items) => (items.includes(key) ? items.filter((item) => item !== key) : [...items, key]));
  };
  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await apiFetch(`/api/users/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: draftPermissions, isAdmin: draftIsAdmin }),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      selectUser(updated);
    } catch {
      notifyFeedback('Erro ao salvar permissões. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <PageHeader
        title="Permissões"
        subtitle="Gerencie usuários e controle o acesso às páginas"
        titleExtra={
          <>
            <InfoButton onClick={() => setShowInfo(true)} />
          </>
        }
        actions={
          <>
            <Button type="button" className={styles.btnPrimary} onClick={() => setShowCreate(true)}>
              + Novo Usuário
            </Button>
          </>
        }
      />
      <div className={styles.layout}>
        <PermissionUserList
          currentUnit={authUser?.isAdmin ? currentUnit : '__none__'}
          onPassword={setPasswordUser}
          onSearch={setSearch}
          onSelect={selectUser}
          search={search}
          selectedId={selected?.id}
          styles={styles}
          users={filteredUsers}
        />
        <section className={styles.permPanel}>
          <PermissionAccessPanel
            allKeys={allKeys}
            config={config}
            draftIsAdmin={draftIsAdmin}
            draftPermissions={draftPermissions}
            onSave={save}
            onTogglePermission={togglePermission}
            readOnly={readOnly}
            saving={saving}
            selected={selected}
            setDraftIsAdmin={setDraftIsAdmin}
            setDraftPermissions={setDraftPermissions}
            styles={styles}
          />
        </section>
      </div>
      {showCreate && (
        <CreateUserModal
          apiFetch={apiFetch}
          allKeys={allKeys}
          configUnit={config.unit}
          configDisplayUnit={config.displayUnit}
          form={form}
          onClose={() => {
            setForm(emptyNewUserForm);
            setShowCreate(false);
          }}
          setForm={setForm}
          setUsers={setUsers}
          styles={styles}
        />
      )}
      {showInfo && <PermissionInfoModal onClose={() => setShowInfo(false)} styles={styles} />}
      {passwordUser && (
        <PasswordModal
          apiFetch={apiFetch}
          onClose={() => setPasswordUser(null)}
          setUsers={setUsers}
          styles={styles}
          user={passwordUser}
        />
      )}
    </main>
  );
}
