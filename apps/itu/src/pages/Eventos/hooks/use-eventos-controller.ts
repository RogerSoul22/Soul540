import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import type { PizzaEvent } from '../../../types/Event';
import { getAvailabilityConflicts, getEventSupplyForecast } from '../../../../../../shared/events/eventOperations';
import type { EventEmployee } from '../types/event-types';
import { emptyEventForm, formatBudget, formatPhone, roleLabels } from '../support/event-formatters';
import type { EventFormData } from '../types/event-form-types';
import { useEventFilters } from './use-event-filters';
import { useEventFormActions } from './use-event-form-actions';
import { useEventResources } from './use-event-resources';
import { useEventViewState } from './use-event-view-state';
import { useEventFormDraft } from './use-event-form-draft';
import { apiFetch } from '../../../lib/api';
import { notifySuccess } from '../../../../../../packages/api-client/src/index';
export function useEventosController() {
  const { events, setEvents, addEvent, updateEvent, deleteEvent } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const { employees, availableMenus } = useEventResources();
  const viewState = useEventViewState();
  const filters = useEventFilters(events);
  const [form, setForm] = useState<EventFormData>(emptyEventForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const employeeMap = useMemo(
    () => Object.fromEntries(employees.map((employee) => [employee.id, employee.name])),
    [employees],
  );
  const formDraft = useEventFormDraft(form);
  const availabilityConflicts = useMemo(
    () => getAvailabilityConflicts(formDraft, events, employees, editingId || undefined),
    [formDraft, events, employees, editingId],
  );
  const formSupplyForecast = useMemo(() => getEventSupplyForecast(formDraft), [formDraft]);
  const openCreate = () => {
    setForm(emptyEventForm);
    setEditingId(null);
    setShowModal(true);
  };
  const openEdit = (event: PizzaEvent) => {
    setForm({
      name: event.name,
      date: event.date,
      endDate: event.endDate || '',
      time: event.time || '',
      duration: event.duration || '',
      location: event.location,
      outOfCity: event.outOfCity || false,
      phone: event.phone || '',
      guestCount: String(event.guestCount),
      budget: event.budget ? formatBudget(String(Math.round(event.budget * 100))) : '',
      responsibleEmployeeId: event.responsibleEmployeeId || '',
      staffCount: event.staffCount ? String(event.staffCount) : '',
      selectedEmployeeIds: event.selectedEmployeeIds || [],
      paymentProofName: event.paymentProofName || '',
      contractPdfName: event.contractPdfName || '',
      createdBy: event.createdBy || '',
      menu: event.menu.join(', '),
      notes: event.notes || '',
      status: (['planning', 'confirmed', 'completed', 'cancelled'].includes(event.status)
        ? event.status
        : 'confirmed') as EventFormData['status'],
      celebration: event.celebration || '',
      teamArrivalTime: event.teamArrivalTime || '',
      city: event.city || '',
      guestsAdult: event.guestsAdult ? String(event.guestsAdult) : '',
      guestsTeen: event.guestsTeen ? String(event.guestsTeen) : '',
      guestsChild: event.guestsChild ? String(event.guestsChild) : '',
      travelCost: event.travelCost ? formatBudget(String(Math.round(event.travelCost * 100))) : '',
      teamPizzaiolo: event.teamPizzaiolo || '',
      teamHelper: event.teamHelper || '',
      teamGarcon: event.teamGarcon || '',
      extrasLoucas: event.extrasLoucas ? String(event.extrasLoucas) : '',
      extrasBebidas: event.extrasBebidas ? String(event.extrasBebidas) : '',
      finalValue: event.finalValue ? formatBudget(String(Math.round(event.finalValue * 100))) : '',
      paymentMethod: event.paymentMethod || '',
      locationImageName: event.locationImageName || '',
      locationImageData: event.locationImageData || '',
      paymentProofData: event.paymentProofData || '',
      contractPdfData: event.contractPdfData || '',
      depositValue: event.depositValue ? formatBudget(String(Math.round(event.depositValue * 100))) : '',
      depositDate: event.depositDate || '',
      pixKey: event.pixKey || '',
      estimatedPizzas: event.estimatedPizzas ? String(event.estimatedPizzas) : '',
      actualPizzas: event.actualPizzas ? String(event.actualPizzas) : '',
      modality: event.modality === 'feirinha' ? 'feirinha' : 'evento_avulso',
      isRecurringTemplate: event.isRecurringTemplate === true,
      recurrenceEndDate: event.recurrenceEndDate || '',
    });
    setEditingId(event.id);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyEventForm);
  };
  const toggleEmployee = (employeeId: string) =>
    setForm((previous) => ({
      ...previous,
      selectedEmployeeIds: previous.selectedEmployeeIds.includes(employeeId)
        ? previous.selectedEmployeeIds.filter((id) => id !== employeeId)
        : [...previous.selectedEmployeeIds, employeeId],
    }));
  const formActions = useEventFormActions({
    form,
    setForm,
    editingId,
    closeModal,
    availabilityConflicts,
    addEvent,
    updateEvent,
  });
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowModal(true);
      setSearchParams({});
    }
  }, []);
  useEffect(() => {
    const editId = searchParams.get('edit');
    const eventToEdit = editId ? events.find((event) => event.id === editId) : undefined;
    if (eventToEdit) {
      openEdit(eventToEdit);
      setSearchParams({});
    }
  }, [events, searchParams, setSearchParams]);
  const confirmDelete = async () => {
    if (viewState.deleteTargetId) await deleteEvent(viewState.deleteTargetId);
    viewState.setDeleteTargetId(null);
  };
  const confirmRecurringOccurrence = async (templateId: string, date: string) => {
    const response = await apiFetch(`/api/events/${templateId}/recurring-occurrence`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
    const created = await response.json();
    if (!response.ok) throw new Error(created?.error || 'Falha ao confirmar ocorrência');
    setEvents((previous) => [...previous.filter((event) => event.id !== created.id), created]);
    notifySuccess('Ocorrência confirmada.');
  };
  return {
    events,
    employees,
    availableMenus,
    employeeMap,
    form,
    setForm,
    editingId,
    showModal,
    setShowModal,
    openCreate,
    openEdit,
    closeModal,
    toggleEmployee,
    formatBudget,
    formatPhone,
    roleLabels,
    formSupplyForecast,
    availabilityConflicts,
    confirmDelete,
    confirmRecurringOccurrence,
    ...filters,
    ...viewState,
    ...formActions,
    addEvent,
    updateEvent,
  };
}
export type EventosController = ReturnType<typeof useEventosController>;
