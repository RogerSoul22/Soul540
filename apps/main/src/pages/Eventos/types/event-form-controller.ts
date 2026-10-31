import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { Employee } from '../../../domain/Employee';
import type { EventFormData } from './event-form-types';

export type AvailabilityConflict = { employeeId: string; employeeName: string; eventName: string };
export type FormSupplyForecast = {
  pizzas: number;
  flourKg: number;
  cheeseKg: number;
  sauceKg: number;
};
export type EventFormController = {
  showModal: boolean;
  editingId: string | null;
  form: EventFormData;
  setForm: Dispatch<SetStateAction<EventFormData>>;
  closeModal: () => void;
  formatBudget: (value: string) => string;
  formatPhone: (value: string) => string;
  handlePaymentFile: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleContractFile: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleLocationImageFile: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleSubmit: () => void | Promise<void>;
  toggleEmployee: (employeeId: string) => void;
  employees: Employee[];
  roleLabels: Record<string, string>;
  availableMenus: string[];
  showMenuDropdown: boolean;
  setShowMenuDropdown: Dispatch<SetStateAction<boolean>>;
  formSupplyForecast: FormSupplyForecast;
  availabilityConflicts: AvailabilityConflict[];
};
