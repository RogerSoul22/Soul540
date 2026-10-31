import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { apiFetch } from '../../../lib/api';
import { ALL_KEYS, EMPTY_FORM, SYSTEM_LABELS, type AppUser, type UserForm } from '../types/permissions-types';

export function usePermissionsController() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [draftPerms, setDraftPerms] = useState<string[]>([]);
  const [draftIsAdmin, setDraftIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [changePwTarget, setChangePwTarget] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [changePwSaving, setChangePwSaving] = useState(false);
  const [search, setSearch] = useState('');

  const currentUnit = (authUser as { unit?: string } | null)?.unit || 'main';
  const isFromOtherUnit = (user: AppUser) => Boolean(user.unit && user.unit !== currentUnit);
  const isReadOnly = (user: AppUser) => isFromOtherUnit(user) && user.isAdmin;
  const canChangePassword = (target: AppUser) => {
    if (!authUser?.isAdmin) return false;
    const myUnit = (authUser as { unit?: string }).unit || 'main';
    return myUnit === 'main' || target.unit === myUnit;
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const unit = SYSTEM_LABELS[user.unit || 'main'] || user.unit || '';
      return [user.name, user.email, unit].some((value) => value.toLowerCase().includes(query));
    });
  }, [users, search]);

  useEffect(() => {
    apiFetch('/api/users')
      .then((response) => response.json())
      .then(setUsers);
  }, []);

  function selectUser(user: AppUser) {
    setSelected(user);
    setDraftPerms([...(user.permissions || [])]);
    setDraftIsAdmin(user.isAdmin || false);
  }

  function togglePerm(key: string) {
    setDraftPerms((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  }

  function toggleAll() {
    const allSelected = draftPerms.length === ALL_KEYS.length;
    setDraftPerms(allSelected ? [] : [...ALL_KEYS]);
    setDraftIsAdmin(!allSelected);
  }

  async function savePermissions() {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await apiFetch('/api/users/' + selected.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: draftPerms, isAdmin: draftIsAdmin }),
      });
      if (!response.ok) throw new Error('Erro ao salvar');
      const updated = (await response.json()) as AppUser;
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      setSelected(updated);
      setDraftPerms([...(updated.permissions || [])]);
      setDraftIsAdmin(updated.isAdmin || false);
    } catch {
      notifyFeedback('Erro ao salvar permissões. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function createUser() {
    if (!form.name.trim() || !form.email.trim() || !form.password) return;
    const response = await apiFetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, permissions: form.isAdmin ? ALL_KEYS : [] }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      notifyFeedback(error.error || 'Erro ao criar usuário');
      return;
    }
    const created = (await response.json()) as AppUser;
    setUsers((current) => [...current, created]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  }

  async function changePassword() {
    if (!changePwTarget || !newPassword.trim()) return;
    setChangePwSaving(true);
    const response = await apiFetch('/api/users/' + changePwTarget.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    const updated = (await response.json()) as AppUser;
    setUsers((current) => current.map((user) => (user.id === updated.id ? { ...user, ...updated } : user)));
    setChangePwTarget(null);
    setNewPassword('');
    setChangePwSaving(false);
  }

  async function deleteUser(user: AppUser) {
    await apiFetch('/api/users/' + user.id, { method: 'DELETE' });
    setUsers((current) => current.filter((item) => item.id !== user.id));
    if (selected?.id === user.id) setSelected(null);
    setDeleteTarget(null);
  }

  return {
    users,
    filteredUsers,
    selected,
    draftPerms,
    draftIsAdmin,
    showModal,
    form,
    saving,
    deleteTarget,
    changePwTarget,
    newPassword,
    changePwSaving,
    search,
    isReadOnly,
    canChangePassword,
    selectUser,
    togglePerm,
    toggleAll,
    savePermissions,
    createUser,
    changePassword,
    deleteUser,
    setDraftPerms,
    setDraftIsAdmin,
    setShowModal,
    setForm,
    setDeleteTarget,
    setChangePwTarget,
    setNewPassword,
    setSearch,
  };
}
