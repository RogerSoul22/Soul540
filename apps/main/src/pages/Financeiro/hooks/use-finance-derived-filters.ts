import { useMemo } from 'react';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import type { FinanceEntry, FinanceCategoryEntry } from '../../../../../../packages/contracts/src/index';
import {
  CATEGORY_COLORS as BUILTIN_CATEGORY_COLORS,
  CATEGORY_LABELS as BUILTIN_CATEGORY_LABELS,
  groupCategoriesBySection,
} from '../../../../../../shared/finance/financeCategories';
import type { FinanceType } from '../../../../../../packages/contracts/src/index';
import { compareTextPtBr as compareAlpha } from '../../../../../../packages/domain/src/index';

type FinanceScope = 'main' | 'franchise' | 'factory' | 'combined';

type FinanceDerivedFiltersInput = {
  finances: FinanceEntry[];
  events: PizzaEvent[];
  financeCategories: FinanceCategoryEntry[];
  franchiseFinances: FinanceEntry[];
  franchiseEvents: PizzaEvent[];
  factoryFinances: FinanceEntry[];
  factoryEvents: PizzaEvent[];
  directEvents: PizzaEvent[];
  dataScope: FinanceScope;
  eventSearch: string;
  formType: FinanceType;
};

export type DataScope = FinanceScope;

export function useFinanceDerivedFilters({
  finances,
  events,
  financeCategories,
  franchiseFinances,
  franchiseEvents,
  factoryFinances,
  factoryEvents,
  directEvents,
  dataScope,
  eventSearch,
  formType,
}: FinanceDerivedFiltersInput) {
  const activeFinances = useMemo(() => {
    if (dataScope === 'franchise') return franchiseFinances;
    if (dataScope === 'factory') return factoryFinances;
    if (dataScope === 'combined') return [...finances, ...franchiseFinances, ...factoryFinances];
    return finances;
  }, [finances, franchiseFinances, factoryFinances, dataScope]);

  const activeEvents = useMemo(() => {
    if (dataScope === 'franchise') return franchiseEvents;
    if (dataScope === 'factory') return factoryEvents;
    if (dataScope === 'combined') return [...events, ...franchiseEvents, ...factoryEvents];
    return events.length > 0 ? events : directEvents;
  }, [events, franchiseEvents, factoryEvents, dataScope, directEvents]);

  const filteredEventsForCombo = useMemo(() => {
    const eventsById = new Map<string, PizzaEvent>();
    for (const event of activeEvents) {
      if (event?.id && event.name?.trim()) eventsById.set(event.id, event);
    }
    const sorted = [...eventsById.values()].sort((a, b) => compareAlpha(a.name, b.name));
    if (!eventSearch) return sorted;
    const query = eventSearch.toLowerCase();
    return sorted.filter((event) => event.name.toLowerCase().includes(query));
  }, [activeEvents, eventSearch]);

  const eventDropdownOptions = useMemo(
    () => [...filteredEventsForCombo].sort((a, b) => compareAlpha(a.name, b.name)),
    [filteredEventsForCombo],
  );

  const categoryLabels = useMemo(() => {
    const merged: Record<string, string> = { ...BUILTIN_CATEGORY_LABELS };
    for (const category of financeCategories) merged[category.key] = category.label;
    return merged;
  }, [financeCategories]);

  const categoryColors = useMemo(() => {
    const merged: Record<string, string> = { ...BUILTIN_CATEGORY_COLORS };
    for (const category of financeCategories) merged[category.key] = category.color || '#64748b';
    return merged;
  }, [financeCategories]);

  const groupedRevenueCategories = useMemo(
    () => groupCategoriesBySection('revenue', financeCategories),
    [financeCategories],
  );
  const groupedCostCategories = useMemo(() => groupCategoriesBySection('cost', financeCategories), [financeCategories]);
  const groupedFormCategories = formType === 'revenue' ? groupedRevenueCategories : groupedCostCategories;

  return {
    activeFinances,
    activeEvents,
    filteredEventsForCombo,
    eventDropdownOptions,
    categoryLabels,
    categoryColors,
    groupedRevenueCategories,
    groupedCostCategories,
    groupedFormCategories,
  };
}
