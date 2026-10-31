export interface Employee {
  id: string;
  name: string;
  role: 'pizzaiolo' | 'auxiliar' | 'garcom' | 'gerente' | 'entregador' | 'administrativo';
  phone: string;
  status: 'ativo' | 'ferias' | 'afastado' | 'desligado';
  createdAt: string;
  email?: string;
  city?: string;
  state?: string;
  hireDate?: string;
  salary?: number;
  commissionRate?: number;
  cpf?: string;
  rg?: string;
  address?: string;
  notes?: string;
  pixKey?: string;
  availableDays?: string[];
  skills?: { name: string; stars: number }[];
}
