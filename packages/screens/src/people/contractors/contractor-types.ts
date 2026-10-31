export type ContractorType = 'pessoa_fisica' | 'pessoa_juridica';
export type ContractorStatus = 'ativo' | 'inativo' | 'bloqueado';
export type DocumentType = 'CPF' | 'RG' | 'CNPJ';

export interface Contractor {
  id: string;
  name: string;
  type: ContractorType;
  document: string;
  documentType?: DocumentType;
  email: string;
  phone: string;
  city?: string;
  address?: string;
  maritalStatus?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  profession?: string;
  category?: string;
  status: ContractorStatus;
  totalRevenue: number;
  createdAt: string;
}

export interface ContractorForm {
  name: string;
  type: ContractorType;
  document: string;
  documentType: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  maritalStatus: string;
  profession: string;
  category: string;
  status: ContractorStatus;
}

export type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;

export const emptyContractorForm: ContractorForm = {
  name: '',
  type: 'pessoa_fisica',
  document: '',
  documentType: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  maritalStatus: '',
  profession: '',
  category: '',
  status: 'ativo',
};

export const contractorStatusConfig: Record<ContractorStatus, { label: string; color: 'green' | 'gray' | 'red' }> = {
  ativo: { label: 'Ativo', color: 'green' },
  inativo: { label: 'Inativo', color: 'gray' },
  bloqueado: { label: 'Bloqueado', color: 'red' },
};
