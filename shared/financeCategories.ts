import type { DreSection, FinanceType, FinanceCategoryEntry } from './types';

// ── Estrutura DRE ───────────────────────────────────────────────────────────
// Reflete exatamente as seções do arquivo "DRE 2026 - SOUL PIZZA.xlsx", na ordem
// em que aparecem no relatório. Usado tanto para agrupar categorias na tela do
// Financeiro (main, franchise e factory) quanto para gerar a exportação no
// padrão DRE. Fonte única — importada por todos os três apps via "@shared".

export interface DreSectionDef {
  key: DreSection;
  label: string;
  sign: '+' | '-';
  type: FinanceType;
}

export const DRE_SECTIONS: DreSectionDef[] = [
  { key: 'faturamentos', label: '( + ) Faturamentos', sign: '+', type: 'revenue' },
  { key: 'deducoes', label: '( - ) Deduções', sign: '-', type: 'cost' },
  { key: 'custos-operacionais', label: '( - ) Custos Operacionais', sign: '-', type: 'cost' },
  { key: 'despesas-logistica', label: '( - ) Despesas c/ Logística', sign: '-', type: 'cost' },
  { key: 'despesas-administrativas', label: '( - ) Despesas Administrativas', sign: '-', type: 'cost' },
  { key: 'despesas-comerciais', label: '( - ) Despesas Comerciais / MKT', sign: '-', type: 'cost' },
  { key: 'despesas-financeiras', label: '( - ) Despesas Financeiras', sign: '-', type: 'cost' },
  { key: 'receitas-nao-operacionais', label: '(+) Receitas Não-Operacionais', sign: '+', type: 'revenue' },
  { key: 'outras-saidas', label: '( - ) Outras Saídas', sign: '-', type: 'cost' },
];

export const DRE_SECTION_LABELS: Record<DreSection, string> = DRE_SECTIONS.reduce(
  (acc, s) => { acc[s.key] = s.label; return acc; },
  {} as Record<DreSection, string>,
);

export interface CategoryDef {
  key: string;
  label: string;
  type: FinanceType;
  section: DreSection;
  color: string;
  /** Só se aplica a categorias de custo: usado no filtro Fixas/Variáveis da aba Despesas. */
  fixed?: boolean;
}

// ── Categorias de Receita ────────────────────────────────────────────────────
// Chaves existentes preservadas (não renomeadas) para não quebrar dados já
// gravados nem a lógica que já depende delas (ex.: vínculo evento↔contrato).
export const REVENUE_CATEGORY_DEFS: CategoryDef[] = [
  { key: 'contrato', label: 'Evento', type: 'revenue', section: 'faturamentos', color: '#22c55e' },
  { key: 'sinal-evento', label: 'Sinal de Evento', type: 'revenue', section: 'faturamentos', color: '#16a34a' },
  { key: 'adicional', label: 'Adicional', type: 'revenue', section: 'faturamentos', color: '#4ade80' },
  { key: 'outro', label: 'Outro', type: 'revenue', section: 'faturamentos', color: '#86efac' },
  { key: 'taxa', label: 'Taxa', type: 'revenue', section: 'faturamentos', color: '#16a34a' },
  { key: 'bebidas', label: 'Bebidas', type: 'revenue', section: 'faturamentos', color: '#38bdf8' },
  { key: 'ingressos', label: 'Ingressos', type: 'revenue', section: 'faturamentos', color: '#0ea5e9' },
  { key: 'patrocinios', label: 'Patrocínios', type: 'revenue', section: 'faturamentos', color: '#0284c7' },
  { key: 'ingredientes', label: 'Ingredientes (Fábrica)', type: 'revenue', section: 'faturamentos', color: '#65a30d' },
  { key: 'receita-nao-operacional', label: 'Receita Não-Operacional', type: 'revenue', section: 'receitas-nao-operacionais', color: '#2dd4bf' },
];

// ── Categorias de Custo/Despesa ──────────────────────────────────────────────
export const COST_CATEGORY_DEFS: CategoryDef[] = [
  // Deduções
  { key: 'impostos', label: 'Impostos (DAS)', type: 'cost', section: 'deducoes', color: '#f97316', fixed: false },
  { key: 'das', label: 'DAS', type: 'cost', section: 'deducoes', color: '#fb7185', fixed: false },
  { key: 'comissoes', label: 'Comissões', type: 'cost', section: 'deducoes', color: '#fbbf24', fixed: false },
  { key: 'tarifa-cartao', label: 'Taxa de Plataforma/Cartão', type: 'cost', section: 'deducoes', color: '#22c55e', fixed: false },

  // Custos Operacionais
  { key: 'salario', label: 'Mão de Obra Direta (Garçom, Ajudantes, Pizzaiolos)', type: 'cost', section: 'custos-operacionais', color: '#dc2626', fixed: true },
  { key: 'cmv', label: 'CMV', type: 'cost', section: 'custos-operacionais', color: '#f87171', fixed: false },
  { key: 'insumos', label: 'Insumos Operacionais e Decorativos', type: 'cost', section: 'custos-operacionais', color: '#ef4444', fixed: false },
  { key: 'bebidas', label: 'Bebidas', type: 'cost', section: 'custos-operacionais', color: '#38bdf8', fixed: false },
  { key: 'marketing-operacional', label: 'Propaganda e Marketing (Operacional)', type: 'cost', section: 'custos-operacionais', color: '#a3e635', fixed: false },
  { key: 'locacao-espaco', label: 'Locação de Espaço', type: 'cost', section: 'custos-operacionais', color: '#fbbf24', fixed: false },
  { key: 'equipamento-estrutura', label: 'Equipamento e Estrutura', type: 'cost', section: 'custos-operacionais', color: '#fb923c', fixed: false },
  { key: 'servicos-limpeza', label: 'Serviços de Limpeza', type: 'cost', section: 'custos-operacionais', color: '#c4b5fd', fixed: false },
  { key: 'embalagens', label: 'Embalagens', type: 'cost', section: 'custos-operacionais', color: '#eab308', fixed: false },
  { key: 'maquinas-manut', label: 'Manutenção de Máquinas/Equipamentos', type: 'cost', section: 'custos-operacionais', color: '#d946ef', fixed: false },
  { key: 'gas', label: 'Gás', type: 'cost', section: 'custos-operacionais', color: '#8b5cf6', fixed: false },
  { key: 'batatas', label: 'Batatas', type: 'cost', section: 'custos-operacionais', color: '#a3e635', fixed: false },
  { key: 'prod-limpeza', label: 'Serviços/Produtos de Limpeza', type: 'cost', section: 'custos-operacionais', color: '#a78bfa', fixed: false },

  // Despesas c/ Logística
  { key: 'mao-obra-indireta', label: 'Mão de Obra Indireta (Motorista)', type: 'cost', section: 'despesas-logistica', color: '#f472b6', fixed: false },
  { key: 'combustivel', label: 'Combustível', type: 'cost', section: 'despesas-logistica', color: '#3b82f6', fixed: false },
  { key: 'pedagio', label: 'Pedágio', type: 'cost', section: 'despesas-logistica', color: '#14b8a6', fixed: false },
  { key: 'carro-manut', label: 'Manutenção Veicular', type: 'cost', section: 'despesas-logistica', color: '#06b6d4', fixed: false },
  { key: 'ipva-multas', label: 'IPVA / Multas', type: 'cost', section: 'despesas-logistica', color: '#fbbf24', fixed: false },
  { key: 'alimentacao', label: 'Alimentação (Equipe/Logística)', type: 'cost', section: 'despesas-logistica', color: '#fb923c', fixed: false },
  { key: 'outras-despesas-logistica', label: 'Outras Despesas (Logística)', type: 'cost', section: 'despesas-logistica', color: '#94a3b8', fixed: false },
  { key: 'logistica', label: 'Logística (Outros)', type: 'cost', section: 'despesas-logistica', color: '#2dd4bf', fixed: false },

  { key: 'deslocamento-evento', label: 'Deslocamento de Evento', type: 'cost', section: 'despesas-logistica', color: '#f59e0b', fixed: false },

  // Despesas Administrativas
  { key: 'agua', label: 'Água', type: 'cost', section: 'despesas-administrativas', color: '#0891b2', fixed: true },
  { key: 'agua-luz', label: 'Água e Luz', type: 'cost', section: 'despesas-administrativas', color: '#0891b2', fixed: true },
  { key: 'telefone-celular', label: 'Telefone/Celular', type: 'cost', section: 'despesas-administrativas', color: '#6366f1', fixed: true },
  { key: 'internet', label: 'Internet', type: 'cost', section: 'despesas-administrativas', color: '#6366f1', fixed: true },
  { key: 'telefone-fixo', label: 'Telefone Fixo', type: 'cost', section: 'despesas-administrativas', color: '#6366f1', fixed: true },
  { key: 'contador', label: 'Escritório de Contabilidade', type: 'cost', section: 'despesas-administrativas', color: '#059669', fixed: true },
  { key: 'iptu', label: 'IPTU', type: 'cost', section: 'despesas-administrativas', color: '#0ea5e9', fixed: true },
  { key: 'taxas-municipais', label: 'Taxas Municipais - Imobiliário', type: 'cost', section: 'despesas-administrativas', color: '#0ea5e9', fixed: true },
  { key: 'software-informatica', label: 'Software/Informática', type: 'cost', section: 'despesas-administrativas', color: '#818cf8', fixed: true },
  { key: 'material-escritorio', label: 'Material de Escritório', type: 'cost', section: 'despesas-administrativas', color: '#94a3b8', fixed: false },
  { key: 'pro-labore', label: 'Pró-Labore (Administrativo)', type: 'cost', section: 'despesas-administrativas', color: '#b91c1c', fixed: true },
  { key: 'salario-administrativo', label: 'Salários - Administrativo', type: 'cost', section: 'despesas-administrativas', color: '#dc2626', fixed: true },
  { key: 'manutencao-predial', label: 'Manutenção Predial', type: 'cost', section: 'despesas-administrativas', color: '#f59e0b', fixed: false },
  { key: 'associacoes-sindicato', label: 'Associações / Sindicato', type: 'cost', section: 'despesas-administrativas', color: '#a3a3a3', fixed: true },
  { key: 'cartorio-correios', label: 'Cartório / Correios', type: 'cost', section: 'despesas-administrativas', color: '#a3a3a3', fixed: false },
  { key: 'tarifa-bancos', label: 'Tarifas Bancárias', type: 'cost', section: 'despesas-administrativas', color: '#6366f1', fixed: true },
  { key: 'aluguel', label: 'Aluguel', type: 'cost', section: 'despesas-administrativas', color: '#0ea5e9', fixed: true },
  { key: 'outros', label: 'Diversos Administrativos', type: 'cost', section: 'despesas-administrativas', color: '#64748b', fixed: false },
  { key: 'moveis-equipamentos-adm', label: 'Aquisição de Móveis e Equip. Adm.', type: 'cost', section: 'despesas-administrativas', color: '#f59e0b', fixed: false },
  { key: 'cursos-treinamentos', label: 'Cursos/Treinamentos/Consultorias', type: 'cost', section: 'despesas-administrativas', color: '#84cc16', fixed: false },
  { key: 'assessoria-juridica', label: 'Assessoria Jurídica', type: 'cost', section: 'despesas-administrativas', color: '#a3a3a3', fixed: false },
  { key: 'copa-cozinha', label: 'Copa/Cozinha', type: 'cost', section: 'despesas-administrativas', color: '#fb923c', fixed: false },

  // Despesas Comerciais / MKT
  { key: 'pro-labore-comercial', label: 'Pró-Labore (Comercial)', type: 'cost', section: 'despesas-comerciais', color: '#b91c1c', fixed: true },
  { key: 'marketing', label: 'Propaganda e Marketing (Comercial)', type: 'cost', section: 'despesas-comerciais', color: '#84cc16', fixed: false },
  { key: 'impulsionamento', label: 'Impulsionamento', type: 'cost', section: 'despesas-comerciais', color: '#a3e635', fixed: false },
  { key: 'materiais-impressos', label: 'Materiais Impressos', type: 'cost', section: 'despesas-comerciais', color: '#eab308', fixed: false },
  { key: 'eventos-comerciais-pos-venda', label: 'Eventos Comerciais, Pós-Venda e Novos Clientes', type: 'cost', section: 'despesas-comerciais', color: '#f472b6', fixed: false },
  { key: 'reembolso-viagens', label: 'Reembolso de Viagens Comerciais', type: 'cost', section: 'despesas-comerciais', color: '#fb923c', fixed: false },
  { key: 'brindes-presentes', label: 'Brindes e Presentes', type: 'cost', section: 'despesas-comerciais', color: '#f43f5e', fixed: false },
  { key: 'premio', label: 'Prêmio/Bônus Equipe', type: 'cost', section: 'despesas-comerciais', color: '#f43f5e', fixed: false },

  // Despesas Financeiras
  { key: 'juros-cheque-especial', label: 'Juros Cheque Especial + Antecipação', type: 'cost', section: 'despesas-financeiras', color: '#f87171', fixed: false },
  { key: 'juros-financiamentos', label: 'Juros s/ Financiamentos', type: 'cost', section: 'despesas-financeiras', color: '#f87171', fixed: false },
  { key: 'juros-fornecedores', label: 'Juros s/ Fornecedores', type: 'cost', section: 'despesas-financeiras', color: '#f87171', fixed: false },

  // Outras Saídas
  { key: 'investimento', label: 'Investimento (Consórcio)', type: 'cost', section: 'outras-saidas', color: '#ca8a04', fixed: true },
  { key: 'financiamento', label: 'Financiamento', type: 'cost', section: 'outras-saidas', color: '#ca8a04', fixed: true },
  { key: 'emprestimos', label: 'Empréstimo (Financiamento/Pronampe)', type: 'cost', section: 'outras-saidas', color: '#7c3aed', fixed: true },
];

export const ALL_CATEGORY_DEFS: CategoryDef[] = [...REVENUE_CATEGORY_DEFS, ...COST_CATEGORY_DEFS];

export const CATEGORY_LABELS: Record<string, string> = ALL_CATEGORY_DEFS.reduce((acc, c) => {
  if (!(c.key in acc)) acc[c.key] = c.label;
  return acc;
}, {} as Record<string, string>);

export const CATEGORY_COLORS: Record<string, string> = ALL_CATEGORY_DEFS.reduce((acc, c) => {
  if (!(c.key in acc)) acc[c.key] = c.color;
  return acc;
}, {} as Record<string, string>);

// Mantidos por compatibilidade: listas de chaves de custo fixo/variável usadas
// no filtro "Fixas/Variáveis" da aba Despesas.
export const FIXED_CATEGORIES = COST_CATEGORY_DEFS.filter((c) => c.fixed).map((c) => c.key);
export const VARIABLE_CATEGORIES = COST_CATEGORY_DEFS.filter((c) => !c.fixed).map((c) => c.key);

export function getCategorySection(
  category: string,
  type: FinanceType,
  custom: FinanceCategoryEntry[] = [],
): DreSection {
  const builtins = type === 'revenue' ? REVENUE_CATEGORY_DEFS : COST_CATEGORY_DEFS;
  const found = builtins.find((c) => c.key === category) ?? custom.find((c) => c.key === category && c.type === type);
  if (found) return found.section;
  return type === 'revenue' ? 'faturamentos' : 'despesas-administrativas';
}

/** Categorias de um tipo, agrupadas por seção do DRE (na ordem do relatório), incluindo as personalizadas. */
export function groupCategoriesBySection(
  type: FinanceType,
  custom: FinanceCategoryEntry[] = [],
): { section: DreSectionDef; categories: CategoryDef[] }[] {
  const builtins = type === 'revenue' ? REVENUE_CATEGORY_DEFS : COST_CATEGORY_DEFS;
  const customDefs: CategoryDef[] = custom
    .filter((c) => c.type === type)
    .map((c) => ({ key: c.key, label: c.label, type: c.type, section: c.section, color: c.color || '#64748b' }));
  const all = [...builtins, ...customDefs];
  return DRE_SECTIONS.filter((s) => s.type === type).map((section) => ({
    section,
    categories: all.filter((c) => c.section === section.key),
  }));
}
