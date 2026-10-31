export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditEntry {
  action: AuditAction;
  description: string;
  id: string;
  resource: string;
  timestamp: string;
  userName: string;
  userUnit: string;
}

export const resourceLabels: Record<string, string> = {
  finances: 'Financeiro',
  events: 'Eventos',
  users: 'Usuários',
  invoices: 'Notas Fiscais',
  contractors: 'Contratantes',
  contracts: 'Contratos',
  menus: 'Cardápios',
};

export const actionLabels: Record<AuditAction, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
};

export const actionColors: Record<AuditAction, string> = {
  create: '#34d399',
  update: '#f59e0b',
  delete: '#f87171',
};
