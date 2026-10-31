import { notifyFeedback, notifySuccess } from '@soul540/api-client';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { apiFetch } from '../../../lib/api';
import {
  EMPTY_FRANCHISE_FORM,
  type Franchise,
  type FranchiseForm,
  type FranchiseStatus,
} from '../types/franchise-types';

export function useFranquiasController() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FranchiseForm>(EMPTY_FRANCHISE_FORM);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/franchises')
      .then((response) => response.json())
      .then(setFranchises)
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      franchises.filter((franchise) => {
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          [franchise.name, franchise.owner, franchise.city].some((value) => value.toLowerCase().includes(query));
        return matchesSearch && (statusFilter === 'all' || franchise.status === statusFilter);
      }),
    [franchises, search, statusFilter],
  );

  function openCreate() {
    setForm(EMPTY_FRANCHISE_FORM);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(franchise: Franchise) {
    setForm({
      name: franchise.name,
      owner: franchise.owner,
      city: franchise.city,
      state: franchise.state,
      monthlyFee: String(franchise.monthlyFee),
      status: franchise.status,
      openDate: franchise.openDate,
    });
    setEditingId(franchise.id);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FRANCHISE_FORM);
  }

  async function submit() {
    if (!form.name || !form.owner) return;
    const data = {
      ...form,
      monthlyFee: Number(form.monthlyFee) || 0,
    };
    if (editingId) {
      const response = await apiFetch('/api/franchises/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updated = (await response.json()) as Franchise;
      setFranchises((current) => current.map((item) => (item.id === editingId ? updated : item)));
    } else {
      const response = await apiFetch('/api/franchises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const created = (await response.json()) as Franchise;
      setFranchises((current) => [created, ...current]);
    }
    closeModal();
  }

  function requestDelete(id: string) {
    setDeleteTargetId(id);
  }

  async function confirmDelete() {
    if (deleteTargetId) {
      await apiFetch('/api/franchises/' + deleteTargetId, { method: 'DELETE' });
      setFranchises((current) => current.filter((item) => item.id !== deleteTargetId));
    }
    setDeleteTargetId(null);
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      try {
        const data = JSON.parse(loadEvent.target?.result as string);
        const payload = {
          name: data.name || 'Nova Franquia',
          owner: data.owner || '',
          city: data.city || '',
          state: data.state || 'SP',
          monthlyFee: Number(data.monthlyFee) || 0,
          status: data.status || 'em_implantacao',
          openDate: data.openDate || new Date().toISOString().split('T')[0],
        };
        const response = await apiFetch('/api/franchises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const created = (await response.json()) as Franchise;
        setFranchises((current) => [created, ...current]);
        notifySuccess('Franquia importada com sucesso!');
      } catch {
        notifyFeedback('Erro ao importar JSON. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  return {
    franchises,
    filtered,
    search,
    statusFilter,
    showModal,
    editingId,
    form,
    deleteTargetId,
    setSearch,
    setStatusFilter,
    setForm,
    setDeleteTargetId,
    openCreate,
    openEdit,
    closeModal,
    submit,
    requestDelete,
    confirmDelete,
    importJson,
  };
}
