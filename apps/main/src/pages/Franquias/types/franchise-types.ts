export type FranchiseStatus = 'ativa' | 'em_implantacao' | 'suspensa' | 'encerrada';

export type Franchise = {
  id: string;
  slug?: string;
  name: string;
  owner: string;
  city: string;
  state: string;
  monthlyFee: number;
  status: FranchiseStatus;
  openDate: string;
  createdAt: string;
};

export type FranchiseForm = {
  name: string;
  owner: string;
  city: string;
  state: string;
  monthlyFee: string;
  status: FranchiseStatus;
  openDate: string;
};

export const EMPTY_FRANCHISE_FORM: FranchiseForm = {
  name: '',
  owner: '',
  city: '',
  state: 'SP',
  monthlyFee: '',
  status: 'em_implantacao',
  openDate: '',
};

export type PortalSystem = 'franchise' | 'factory';

export type PortalStats = {
  events: number;
  tasks: number;
  employees: number;
  revenue: number;
};
