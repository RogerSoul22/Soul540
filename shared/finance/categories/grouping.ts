import type { DreSection, FinanceCategoryEntry, FinanceType } from '../../contracts/types';
import {
  COST_CATEGORY_DEFS,
  DRE_SECTIONS,
  REVENUE_CATEGORY_DEFS,
  type CategoryDef,
  type DreSectionDef,
} from './definitions';

export function getCategorySection(
  category: string,
  type: FinanceType,
  custom: FinanceCategoryEntry[] = [],
): DreSection {
  const builtins = type === 'revenue' ? REVENUE_CATEGORY_DEFS : COST_CATEGORY_DEFS;
  const found =
    builtins.find((item) => item.key === category) ??
    custom.find((item) => item.key === category && item.type === type);
  if (found) return found.section;
  return type === 'revenue' ? 'faturamentos' : 'despesas-administrativas';
}

export function groupCategoriesBySection(
  type: FinanceType,
  custom: FinanceCategoryEntry[] = [],
): { section: DreSectionDef; categories: CategoryDef[] }[] {
  const builtins = type === 'revenue' ? REVENUE_CATEGORY_DEFS : COST_CATEGORY_DEFS;
  const customDefs: CategoryDef[] = custom
    .filter((item) => item.type === type)
    .map((item) => ({
      key: item.key,
      label: item.label,
      type: item.type,
      section: item.section,
      color: item.color || '#64748b',
    }));
  const all = [...builtins, ...customDefs];
  return DRE_SECTIONS.filter((section) => section.type === type).map((section) => ({
    section,
    categories: all.filter((category) => category.section === section.key),
  }));
}
