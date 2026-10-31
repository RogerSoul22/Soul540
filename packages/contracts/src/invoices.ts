export type InvoiceStatus = 'rascunho' | 'emitida' | 'cancelada';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  ncm?: string;
  cfop?: string;
  unit?: string;
}

export interface Invoice {
  id: string;
  eventId: string;
  clientName: string;
  clientDocument: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalValue: number;
  issueDate: string;
  notes: string;
  status: InvoiceStatus;
  type?: 'nfse' | 'nfe';
  serviceCode?: string;
  clientAddress?: string;
  clientNumber?: string;
  clientDistrict?: string;
  clientCity?: string;
  clientState?: string;
  clientPostalCode?: string;
  emissaoStatus?: 'processing' | 'emitida' | 'erro';
  numeroNF?: string;
  chaveAcesso?: string;
  protocolo?: string;
  xmlEmitido?: string;
  emissaoMotivo?: string;
  nfeioId?: string;
  nfeioStatus?: 'processing' | 'issued' | 'error';
  nfeioNumber?: string;
  nfeioPdfUrl?: string;
  nfeioXmlUrl?: string;
  nfeioAccessKey?: string;
  nfeioProtocol?: string;
  nfeioRawResponse?: Record<string, unknown>;
  createdAt: string;
}
