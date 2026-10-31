import { maskCurrency } from './contract-formatters';

export interface ContractForm {
  clientName: string;
  clientDocument: string;
  clientRg: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  eventId: string;
  description: string;
  pricePerAdult: string;
  adultsCount: string;
  pricePerChild: string;
  childrenCount: string;
  additionalServices: string;
  value: string;
  minGuests: string;
  serviceType: string;
  drinksDescription: string;
  cancellationDays: string;
  pizzaTeam: string;
  drinksTeam: string;
  startDate: string;
  endDate: string;
  paymentConditions: string;
  terms: string;
  menuId: string;
  paid: boolean;
  noticeHours: string;
  serviceObservation: string;
  paymentObservation: string;
  lateFeePercent: string;
  lateFeeHours: string;
  additionalServicesObservation: string;
}

type NumericContractFields =
  | 'pricePerAdult'
  | 'adultsCount'
  | 'pricePerChild'
  | 'childrenCount'
  | 'value'
  | 'minGuests'
  | 'cancellationDays'
  | 'pizzaTeam'
  | 'drinksTeam'
  | 'noticeHours'
  | 'lateFeePercent'
  | 'lateFeeHours';

export type ContractFormSource = Omit<Partial<ContractForm>, NumericContractFields> & {
  pricePerAdult?: number;
  adultsCount?: number;
  pricePerChild?: number;
  childrenCount?: number;
  value?: number;
  minGuests?: number;
  cancellationDays?: number;
  pizzaTeam?: number;
  drinksTeam?: number;
  noticeHours?: number;
  lateFeePercent?: number;
  lateFeeHours?: number;
};

export const emptyContractForm: ContractForm = {
  clientName: '',
  clientDocument: '',
  clientRg: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  eventId: '',
  description: '',
  pricePerAdult: '',
  adultsCount: '',
  pricePerChild: '',
  childrenCount: '',
  additionalServices: '',
  value: '',
  minGuests: '',
  serviceType: 'self service e coquetel',
  drinksDescription: '',
  cancellationDays: '30',
  pizzaTeam: '',
  drinksTeam: '',
  startDate: '',
  endDate: '',
  paymentConditions: '',
  terms: '',
  menuId: '',
  paid: false,
  noticeHours: '1',
  serviceObservation: '',
  paymentObservation: '',
  lateFeePercent: '30',
  lateFeeHours: '48',
  additionalServicesObservation: '',
};

function decimal(value?: number) {
  return value ? maskCurrency(String(Math.round(value * 100))) : '';
}
function integer(value: number | undefined, fallback = '') {
  return value?.toString() || fallback;
}

export function toContractForm(contract: ContractFormSource): ContractForm {
  return {
    ...emptyContractForm,
    ...contract,
    pricePerAdult: decimal(contract.pricePerAdult),
    adultsCount: integer(contract.adultsCount),
    pricePerChild: decimal(contract.pricePerChild),
    childrenCount: integer(contract.childrenCount),
    value: decimal(contract.value),
    minGuests: integer(contract.minGuests),
    cancellationDays: integer(contract.cancellationDays, '30'),
    pizzaTeam: integer(contract.pizzaTeam),
    drinksTeam: integer(contract.drinksTeam),
    noticeHours: integer(contract.noticeHours, '1'),
    lateFeePercent: integer(contract.lateFeePercent, '30'),
    lateFeeHours: integer(contract.lateFeeHours, '48'),
  };
}

export function filterContracts<Contract extends { clientName: string; description: string }>(
  contracts: Contract[],
  search: string,
) {
  const term = search.trim().toLowerCase();
  if (!term) return contracts;
  return contracts.filter(
    (contract) => contract.clientName.toLowerCase().includes(term) || contract.description.toLowerCase().includes(term),
  );
}
