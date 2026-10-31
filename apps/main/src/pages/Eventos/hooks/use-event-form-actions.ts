import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import type { EventFormData } from '../types/event-form-types';

type Conflict = { employeeName: string; eventName: string };
type EventFormActionsArgs = {
  form: EventFormData;
  setForm: Dispatch<SetStateAction<EventFormData>>;
  editingId: string | null;
  closeModal: () => void;
  availabilityConflicts: Conflict[];
  addEvent: (event: Omit<PizzaEvent, 'id' | 'createdAt'>) => Promise<unknown>;
  updateEvent: (id: string, event: Partial<PizzaEvent>) => Promise<unknown>;
};

const parseMoney = (value: string) => Number(value.replace(/[R$\s.]/g, '').replace(',', '.')) || undefined;

export function useEventFormActions({
  form,
  setForm,
  editingId,
  closeModal,
  availabilityConflicts,
  addEvent,
  updateEvent,
}: EventFormActionsArgs) {
  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  const compressImage = (file: File, maxWidth = 1200, quality = 0.75): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, maxWidth / image.width);
          const canvas = document.createElement('canvas');
          canvas.width = image.width * scale;
          canvas.height = image.height * scale;
          canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        image.src = event.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  const handleFile = async (
    event: ChangeEvent<HTMLInputElement>,
    name: keyof EventFormData,
    dataName: keyof EventFormData,
    compress: boolean,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const data =
        compress && file.type.startsWith('image/') ? await compressImage(file) : await readFileAsDataURL(file);
      setForm((previous) => ({ ...previous, [name]: file.name, [dataName]: data }));
    }
    event.target.value = '';
  };
  const handleSubmit = async () => {
    if (!form.name || !form.date || !form.location) return;
    if (availabilityConflicts.length > 0) {
      const conflictSummary = availabilityConflicts
        .map((item) => item.employeeName + ' em ' + item.eventName)
        .join(', ');
      notifyFeedback(`Funcionário indisponível nesta data: ${conflictSummary}`);
      return;
    }
    const data: Omit<PizzaEvent, 'id' | 'createdAt'> = {
      name: form.name,
      date: form.date,
      endDate: form.endDate || undefined,
      time: form.time || undefined,
      duration: form.duration || undefined,
      location: form.location,
      outOfCity: form.outOfCity,
      phone: form.phone || undefined,
      guestCount: Number(form.guestCount) || 0,
      status: form.status,
      modality: form.modality,
      isRecurringTemplate: form.modality === 'feirinha',
      recurrenceEndDate: form.modality === 'feirinha' ? form.recurrenceEndDate || undefined : undefined,
      budget: parseMoney(form.budget) || 0,
      menu: form.menu
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      notes: form.notes,
      responsibleEmployeeId: form.responsibleEmployeeId || undefined,
      staffCount: Number(form.staffCount) || undefined,
      selectedEmployeeIds: form.selectedEmployeeIds.length ? form.selectedEmployeeIds : undefined,
      paymentProofName: form.paymentProofName || undefined,
      contractPdfName: form.contractPdfName || undefined,
      createdBy: form.createdBy || undefined,
      celebration: form.celebration || undefined,
      teamArrivalTime: form.teamArrivalTime || undefined,
      city: form.city || undefined,
      guestsAdult: Number(form.guestsAdult) || undefined,
      guestsTeen: Number(form.guestsTeen) || undefined,
      guestsChild: Number(form.guestsChild) || undefined,
      travelCost: parseMoney(form.travelCost),
      teamPizzaiolo: form.teamPizzaiolo || undefined,
      teamHelper: form.teamHelper || undefined,
      teamGarcon: form.teamGarcon || undefined,
      extrasLoucas: Number(form.extrasLoucas) || undefined,
      extrasBebidas: Number(form.extrasBebidas) || undefined,
      finalValue: parseMoney(form.finalValue),
      paymentMethod: form.paymentMethod || undefined,
      locationImageName: form.locationImageName || undefined,
      locationImageData: form.locationImageData || undefined,
      paymentProofData: form.paymentProofData || undefined,
      contractPdfData: form.contractPdfData || undefined,
      depositValue: parseMoney(form.depositValue),
      depositDate: form.depositDate || undefined,
      pixKey: form.pixKey || undefined,
      estimatedPizzas: Number(form.estimatedPizzas) || undefined,
      actualPizzas: Number(form.actualPizzas) || undefined,
    };
    try {
      if (editingId) await updateEvent(editingId, data);
      else await addEvent(data);
      closeModal();
    } catch (error) {
      notifyFeedback(error instanceof Error ? error.message : 'Falha ao salvar evento');
    }
  };
  return {
    handlePaymentFile: (event: ChangeEvent<HTMLInputElement>) =>
      handleFile(event, 'paymentProofName', 'paymentProofData', true),
    handleContractFile: (event: ChangeEvent<HTMLInputElement>) =>
      handleFile(event, 'contractPdfName', 'contractPdfData', false),
    handleLocationImageFile: (event: ChangeEvent<HTMLInputElement>) =>
      handleFile(event, 'locationImageName', 'locationImageData', true),
    handleSubmit,
  };
}
