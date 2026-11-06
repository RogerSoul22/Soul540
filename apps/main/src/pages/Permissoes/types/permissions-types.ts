export type AppUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  permissions: string[];
  unit?: string;
};

export type UserForm = {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  unit: string;
  franchiseId: string;
};

export const SYSTEM_LABELS: Record<string, string> = {
  main: 'Principal',
  franchise: 'Franquia',
  factory: 'Fábrica',
};

export const ALL_PAGES = [
  { group: 'Principal', items: [{ key: 'dashboard', label: 'Dashboard' }] },
  {
    group: 'Gestão',
    items: [
      { key: 'eventos', label: 'Eventos' },
      { key: 'tarefas', label: 'Tarefas' },
      { key: 'funcionarios', label: 'Funcionários' },
      { key: 'contratantes', label: 'Contratantes' },
    ],
  },
  {
    group: 'Financeiro',
    items: [
      { key: 'financeiro', label: 'Financeiro' },
      { key: 'notas-fiscais', label: 'Notas Fiscais' },
      { key: 'contratos', label: 'Contratos' },
    ],
  },
  {
    group: 'Operações',
    items: [
      { key: 'cardapios', label: 'Cardápios' },
      { key: 'estoque-insumos', label: 'Est. Insumos' },
      { key: 'estoque-utensilios', label: 'Est. Utensílios' },
    ],
  },
  { group: 'Expansão', items: [{ key: 'franquias', label: 'Franquias' }] },
  {
    group: 'Sistema',
    items: [
      { key: 'chat', label: 'Chat IA' },
      { key: 'usuario', label: 'Minha Conta' },
      { key: 'permissoes', label: 'Permissões' },
    ],
  },
] as const;

export const ALL_KEYS = ALL_PAGES.flatMap((group) => group.items.map((item) => item.key));
export const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  password: '',
  isAdmin: false,
  unit: 'main',
  franchiseId: '',
};
