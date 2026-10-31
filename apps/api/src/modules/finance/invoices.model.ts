import { Schema } from 'mongoose';
import { createTenantModels } from '../../infrastructure/tenant-model';
const InvoiceItemSchema = new Schema(
  {
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    ncm: { type: String, default: '' },
    cfop: { type: String, default: '' },
    unit: { type: String, default: 'UN' },
  },
  { _id: false },
);

// Lookup IBGE city code by name (SP state — expand as needed)
const IBGE_CITIES: Record<string, number> = {
  sorocaba: 3552205,
  'sao paulo': 3550308,
  campinas: 3509502,
  santos: 3548100,
  'ribeirao preto': 3543402,
  'sao bernardo do campo': 3548708,
  'santo andre': 3547809,
  osasco: 3534401,
  guarulhos: 3518800,
  indaiatuba: 3520509,
  jundiai: 3525904,
  piracicaba: 3538709,
  limeira: 3526902,
  bauru: 3506003,
  marilia: 3529005,
  'presidente prudente': 3541406,
  'sao jose dos campos': 3549904,
  'sao jose do rio preto': 3549805,
};

function ibgeCity(cityName: string): { code?: number; name: string } {
  const key = cityName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const code = IBGE_CITIES[key];
  return code ? { code, name: cityName } : { name: cityName };
}

export const models = createTenantModels(
  'Invoice',
  {
    eventId: { type: String, default: '' },
    clientName: { type: String, default: '' },
    clientDocument: { type: String, default: '' },
    clientEmail: { type: String, default: '' },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    issueDate: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, default: 'rascunho' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    // Tipo e configuração fiscal
    type: { type: String, default: 'nfse' },
    serviceCode: { type: String, default: '' },

    // Endereço do tomador/destinatário
    clientAddress: { type: String, default: '' },
    clientNumber: { type: String, default: '' },
    clientDistrict: { type: String, default: '' },
    clientCity: { type: String, default: '' },
    clientState: { type: String, default: '' },
    clientPostalCode: { type: String, default: '' },

    // Emissão fiscal — campos genéricos (NF-e direto SEFAZ)
    emissaoStatus: { type: String, default: null },
    numeroNF: { type: String, default: null },
    chaveAcesso: { type: String, default: null },
    protocolo: { type: String, default: null },
    xmlEmitido: { type: String, default: null },
    emissaoMotivo: { type: String, default: null },

    // Asaas — NFS-e
    asaasPaymentId: { type: String, default: null }, // ID da cobrança no Asaas (ex: pay_xxx)
    asaasInvoiceId: { type: String, default: null }, // ID da NFS-e retornado pelo Asaas
    asaasStatus: { type: String, default: null },
    asaasPdfUrl: { type: String, default: null },
    asaasXmlUrl: { type: String, default: null },
    asaasRawResponse: { type: Object, default: null },
  },
  { main: 'invoices', franchise: 'franchiseinvoices', factory: 'factoryinvoices' },
);
