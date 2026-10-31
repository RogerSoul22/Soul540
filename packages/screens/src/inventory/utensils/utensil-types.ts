export type UtensilStatus = 'disponivel' | 'em_uso' | 'manutencao' | 'descartado';

export interface Utensil {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitValue?: number;
  location: string;
  status: UtensilStatus;
  createdAt: string;
}

export interface UtensilForm {
  name: string;
  category: string;
  quantity: string;
  unitValue: string;
  location: string;
  status: UtensilStatus;
}

export type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;

export const emptyUtensilForm: UtensilForm = {
  name: '',
  category: '',
  quantity: '1',
  unitValue: '',
  location: '',
  status: 'disponivel',
};

export const utensilStatusConfig: Record<UtensilStatus, { label: string; color: 'green' | 'blue' | 'amber' | 'gray' }> =
  {
    disponivel: { label: 'Disponível', color: 'green' },
    em_uso: { label: 'Em Uso', color: 'blue' },
    manutencao: { label: 'Manutenção', color: 'amber' },
    descartado: { label: 'Descartado', color: 'gray' },
  };
