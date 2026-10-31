import type { Invoice, InvoiceItem, InvoiceStatus } from '../../../../../../packages/contracts/src/index';

export type FilterStatus = 'all' | InvoiceStatus;
export type InvoiceFormType = 'nfse' | 'nfe';

export type InvoiceFormState = {
  eventId: string;
  clientName: string;
  clientDocument: string;
  clientEmail: string;
  issueDate: string;
  taxRate: string;
  notes: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  type: InvoiceFormType;
  serviceCode: string;
  address: string;
  addressNumber: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
};

export const statusLabels: Record<InvoiceStatus, string> = {
  rascunho: 'Rascunho',
  emitida: 'Emitida',
  cancelada: 'Cancelada',
};

export const statusColors: Record<InvoiceStatus, 'gray' | 'green' | 'red'> = {
  rascunho: 'gray',
  emitida: 'green',
  cancelada: 'red',
};

export function createEmptyInvoiceItem(): InvoiceItem {
  return { description: '', quantity: 1, unitPrice: 0, ncm: '', cfop: '', unit: 'UN' };
}

export function createEmptyInvoiceForm(): InvoiceFormState {
  return {
    eventId: '',
    clientName: '',
    clientDocument: '',
    clientEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    taxRate: '5',
    notes: '',
    status: 'rascunho',
    items: [createEmptyInvoiceItem()],
    type: 'nfse',
    serviceCode: '',
    address: '',
    addressNumber: '',
    district: '',
    city: '',
    state: '',
    postalCode: '',
  };
}
