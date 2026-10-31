import { format, isValid, parseISO } from 'date-fns';
import type { EventFormData } from '../types/event-form-types';

export function safeFormat(
  date: string | undefined | null,
  fmt: string,
  options?: Parameters<typeof format>[2],
): string {
  if (!date) return '—';
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, fmt, options) : '—';
}

export function formatBudget(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const amount = parseInt(digits, 10);
  return `R$ ${Math.floor(amount / 100).toLocaleString('pt-BR')},${String(amount % 100).padStart(2, '0')}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export const roleLabels: Record<string, string> = {
  pizzaiolo: 'Pizzaiolo',
  auxiliar: 'Auxiliar',
  garcom: 'Garcom',
  gerente: 'Gerente',
  entregador: 'Entregador',
  administrativo: 'Administrativo',
};

export const emptyEventForm: EventFormData = {
  name: '',
  date: '',
  endDate: '',
  time: '',
  duration: '',
  location: '',
  outOfCity: false,
  phone: '',
  guestCount: '',
  budget: '',
  responsibleEmployeeId: '',
  staffCount: '',
  selectedEmployeeIds: [],
  paymentProofName: '',
  contractPdfName: '',
  createdBy: '',
  menu: '',
  notes: '',
  status: 'confirmed',
  modality: 'evento_avulso',
  recurrenceEndDate: '',
  celebration: '',
  teamArrivalTime: '',
  city: '',
  guestsAdult: '',
  guestsTeen: '',
  guestsChild: '',
  travelCost: '',
  teamPizzaiolo: '',
  teamHelper: '',
  teamGarcon: '',
  extrasLoucas: '',
  extrasBebidas: '',
  finalValue: '',
  paymentMethod: '',
  locationImageName: '',
  locationImageData: '',
  paymentProofData: '',
  contractPdfData: '',
  depositValue: '',
  depositDate: '',
  pixKey: '',
  estimatedPizzas: '',
  actualPizzas: '',
};
