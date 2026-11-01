import { ALL_CATEGORY_DEFS, COST_CATEGORY_DEFS, DRE_SECTIONS } from './definitions';
import type { DreSection } from '../../contracts/types';

export const DRE_SECTION_LABELS: Record<DreSection, string> = DRE_SECTIONS.reduce(
  (acc, section) => {
    acc[section.key] = section.label;
    return acc;
  },
  {} as Record<DreSection, string>,
);

export const CATEGORY_LABELS: Record<string, string> = ALL_CATEGORY_DEFS.reduce(
  (acc, category) => {
    if (!(category.key in acc)) acc[category.key] = category.label;
    return acc;
  },
  {} as Record<string, string>,
);

export const CATEGORY_COLORS: Record<string, string> = ALL_CATEGORY_DEFS.reduce(
  (acc, category) => {
    if (!(category.key in acc)) acc[category.key] = category.color;
    return acc;
  },
  {} as Record<string, string>,
);

export const FIXED_CATEGORIES = COST_CATEGORY_DEFS.filter((category) => category.fixed).map((category) => category.key);
export const VARIABLE_CATEGORIES = COST_CATEGORY_DEFS.filter((category) => !category.fixed).map(
  (category) => category.key,
);
