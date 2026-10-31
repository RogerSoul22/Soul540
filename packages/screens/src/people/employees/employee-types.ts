export type EmployeeRole = 'pizzaiolo' | 'auxiliar' | 'garcom' | 'gerente' | 'entregador' | 'administrativo';

export type EmployeeStatus = 'ativo' | 'ferias' | 'afastado' | 'desligado';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  status: EmployeeStatus;
  createdAt: string;
  email?: string;
  city?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  notes?: string;
  pixKey?: string;
  commissionRate?: number;
  availableDays?: string[];
}

export interface EmployeeForm {
  name: string;
  role: EmployeeRole;
  phone: string;
  cpf: string;
  rg: string;
  address: string;
  notes: string;
  pixKey: string;
  commissionRate: string;
  availableDays: string[];
  status: EmployeeStatus;
}

export type UpdateEmployeeForm = <Field extends keyof EmployeeForm>(field: Field, value: EmployeeForm[Field]) => void;

export type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;

export const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

export const dayLabels: Record<string, string> = {
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sáb',
  dom: 'Dom',
};

export const roleLabels: Record<EmployeeRole, string> = {
  pizzaiolo: 'Pizzaiolo',
  auxiliar: 'Auxiliar',
  garcom: 'Garçom/Garçonete',
  gerente: 'Gerente',
  entregador: 'Entregador',
  administrativo: 'Administrativo',
};

export const employeeStatusConfig: Record<
  EmployeeStatus,
  { label: string; color: 'green' | 'blue' | 'amber' | 'gray' }
> = {
  ativo: { label: 'Ativo', color: 'green' },
  ferias: { label: 'Férias', color: 'blue' },
  afastado: { label: 'Afastado', color: 'amber' },
  desligado: { label: 'Desligado', color: 'gray' },
};

export const emptyEmployeeForm: EmployeeForm = {
  name: '',
  role: 'auxiliar',
  phone: '',
  cpf: '',
  rg: '',
  address: '',
  notes: '',
  pixKey: '',
  commissionRate: '0',
  availableDays: [],
  status: 'ativo',
};
