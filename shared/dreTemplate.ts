import { getCategorySection } from './financeCategories';
import type { DreSection, FinanceCategoryEntry, FinanceEntry } from './types';

export const DRE_TEMPLATE_SHEET = 'DRE 2026';

const MONTH_COLUMNS: Record<string, string> = {
  '2026-07': 'B',
  '2026-08': 'D',
  '2026-09': 'F',
  '2026-10': 'H',
  '2026-11': 'J',
  '2026-12': 'L',
};

const CATEGORY_ROWS: Record<string, number> = {
  'revenue:contrato': 4,
  'revenue:sinal-evento': 4,
  'revenue:adicional': 4,
  'revenue:outro': 4,
  'revenue:taxa': 4,
  'revenue:bebidas': 5,
  'revenue:ingressos': 6,
  'revenue:patrocinios': 7,
  'revenue:ingredientes': 4,
  'revenue:receita-nao-operacional': 81,
  'cost:impostos': 11,
  'cost:das': 11,
  'cost:comissoes': 12,
  'cost:tarifa-cartao': 13,
  'cost:salario': 17,
  'cost:cmv': 18,
  'cost:insumos': 19,
  'cost:bebidas': 20,
  'cost:marketing-operacional': 21,
  'cost:locacao-espaco': 22,
  'cost:equipamento-estrutura': 23,
  'cost:servicos-limpeza': 24,
  'cost:embalagens': 19,
  'cost:maquinas-manut': 23,
  'cost:gas': 19,
  'cost:batatas': 18,
  'cost:prod-limpeza': 24,
  'cost:mao-obra-indireta': 28,
  'cost:combustivel': 29,
  'cost:pedagio': 30,
  'cost:carro-manut': 31,
  'cost:ipva-multas': 32,
  'cost:alimentacao': 33,
  'cost:outras-despesas-logistica': 34,
  'cost:logistica': 34,
  'cost:deslocamento-evento': 34,
  'cost:agua': 39,
  'cost:agua-luz': 39,
  'cost:telefone-celular': 40,
  'cost:internet': 41,
  'cost:telefone-fixo': 42,
  'cost:contador': 43,
  'cost:iptu': 44,
  'cost:taxas-municipais': 45,
  'cost:software-informatica': 46,
  'cost:material-escritorio': 47,
  'cost:pro-labore': 48,
  'cost:salario-administrativo': 49,
  'cost:manutencao-predial': 50,
  'cost:associacoes-sindicato': 51,
  'cost:cartorio-correios': 52,
  'cost:tarifa-bancos': 53,
  'cost:aluguel': 54,
  'cost:outros': 55,
  'cost:moveis-equipamentos-adm': 56,
  'cost:cursos-treinamentos': 57,
  'cost:assessoria-juridica': 58,
  'cost:copa-cozinha': 59,
  'cost:pro-labore-comercial': 63,
  'cost:marketing': 64,
  'cost:impulsionamento': 65,
  'cost:materiais-impressos': 66,
  'cost:eventos-comerciais-pos-venda': 67,
  'cost:reembolso-viagens': 68,
  'cost:brindes-presentes': 69,
  'cost:premio': 69,
  'cost:juros-cheque-especial': 72,
  'cost:juros-financiamentos': 73,
  'cost:juros-fornecedores': 74,
  'cost:investimento': 84,
  'cost:financiamento': 85,
  'cost:emprestimos': 86,
};

const SECTION_FALLBACK_ROWS: Record<DreSection, number> = {
  faturamentos: 4,
  deducoes: 13,
  'custos-operacionais': 19,
  'despesas-logistica': 34,
  'despesas-administrativas': 55,
  'despesas-comerciais': 67,
  'despesas-financeiras': 74,
  'receitas-nao-operacionais': 81,
  'outras-saidas': 86,
};

export function buildDreTemplateValues(
  finances: FinanceEntry[],
  customCategories: FinanceCategoryEntry[] = [],
): Map<string, number> {
  const values = new Map<string, number>();

  for (const finance of finances) {
    const column = MONTH_COLUMNS[finance.date?.slice(0, 7)];
    if (!column || !Number.isFinite(finance.amount)) continue;
    const key = `${finance.type}:${finance.category}`;
    const section = getCategorySection(finance.category, finance.type, customCategories);
    const row = CATEGORY_ROWS[key] ?? SECTION_FALLBACK_ROWS[section];
    const cell = `${column}${row}`;
    values.set(cell, (values.get(cell) ?? 0) + finance.amount);
  }

  return values;
}

export const DRE_TEMPLATE_INPUT_CELLS = Object.values(MONTH_COLUMNS).flatMap((column) =>
  [...new Set([...Object.values(CATEGORY_ROWS), ...Object.values(SECTION_FALLBACK_ROWS)])].map((row) => `${column}${row}`),
);
