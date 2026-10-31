import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { apiFetch } from '../../lib/api';
import { emptyContractForm, filterContracts, parseCurrency, toContractForm } from '@soul540/screens';
import { ConfirmModal } from '@soul540/ui';
import ContractDocument from './components/ContractDocument';
import ContractFormModal from './components/ContractFormModal';
import ContractList from './components/ContractList';
import type { Contract, FormData } from './types/contract-types';
import styles from './styles/Contratos.module.scss';

function toPayload(form: FormData) {
  return {
    ...form,
    pricePerAdult: parseCurrency(form.pricePerAdult),
    adultsCount: Number(form.adultsCount) || 0,
    pricePerChild: parseCurrency(form.pricePerChild),
    childrenCount: Number(form.childrenCount) || 0,
    value: parseCurrency(form.value),
    minGuests: Number(form.minGuests) || 0,
    cancellationDays: Number(form.cancellationDays) || 30,
    pizzaTeam: Number(form.pizzaTeam) || 0,
    drinksTeam: Number(form.drinksTeam) || 0,
    noticeHours: Number(form.noticeHours) || 1,
    lateFeePercent: Number(form.lateFeePercent) || 30,
    lateFeeHours: Number(form.lateFeeHours) || 48,
  };
}

export default function Contratos() {
  const { events } = useApp();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormData>(emptyContractForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => {
    apiFetch('/api/contracts')
      .then((response) => response.json())
      .then(setContracts)
      .catch(() => undefined);
  }, []);
  const filtered = useMemo(() => filterContracts(contracts, search), [contracts, search]);
  const closeForm = () => {
    setEditingId(null);
    setForm(emptyContractForm);
  };
  const openEdit = (contract: Contract) => {
    setEditingId(contract.id);
    setForm(toContractForm(contract));
  };
  const save = async () => {
    if (!form.clientName) return;
    const isEdit = editingId !== null && editingId !== 'new';
    const options = {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(form)),
    };
    const response = await apiFetch(isEdit ? '/api/contracts/' + editingId : '/api/contracts', options);
    const contract: Contract = await response.json();
    setContracts((current) =>
      isEdit ? current.map((item) => (item.id === contract.id ? contract : item)) : [contract, ...current],
    );
    closeForm();
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    await apiFetch('/api/contracts/' + deleteId, { method: 'DELETE' });
    setContracts((current) => current.filter((contract) => contract.id !== deleteId));
    setDeleteId(null);
  };
  const eventList = events.map((event) => ({ id: event.id, name: event.name }));
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contratos</h1>
          <p className={styles.subtitle}>Gerencie contratos e acordos com clientes</p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => {
            setEditingId('new');
            setForm(emptyContractForm);
          }}
        >
          + Novo Contrato
        </button>
      </div>
      <ContractList
        contracts={filtered}
        events={eventList}
        search={search}
        onSearchChange={setSearch}
        onView={setViewContract}
        onEdit={openEdit}
        onDelete={setDeleteId}
      />
      {editingId && (
        <ContractFormModal
          form={form}
          editing={editingId !== 'new'}
          events={eventList}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onClose={closeForm}
          onSubmit={save}
        />
      )}
      {viewContract && (
        <ContractDocument
          contract={viewContract}
          event={events.find((event) => event.id === viewContract.eventId)}
          eventName={
            viewContract.eventId ? eventList.find((event) => event.id === viewContract.eventId)?.name || '' : ''
          }
          onClose={() => setViewContract(null)}
        />
      )}
      {deleteId && (
        <ConfirmModal
          title="Excluir Contrato"
          message={
            <>
              Tem certeza que deseja excluir{' '}
              <strong>{contracts.find((item) => item.id === deleteId)?.clientName}</strong>?
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={confirmDelete}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
