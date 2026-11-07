import { useMemo } from 'react';
import { compareTextPtBr as compareAlpha } from '../../../../../../packages/domain/src/index';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  groupCategoriesBySection,
} from '../../../../../../shared/finance/financeCategories';
import type { FranchiseFinanceState } from './use-franchise-finance-state';

type Props = Pick<FranchiseFinanceState, 'events' | 'financeCategories' | 'eventSearch' | 'formType'>;

export function useFranchiseFinanceCategories({ events, financeCategories, eventSearch, formType }: Props) {
  const categoryLabels = useMemo(() => {
    const labels: Record<string, string> = { ...CATEGORY_LABELS };
    financeCategories.forEach((category) => {
      labels[category.key] = category.label;
    });
    return labels;
  }, [financeCategories]);
  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = { ...CATEGORY_COLORS };
    financeCategories.forEach((category) => {
      colors[category.key] = category.color || '#64748b';
    });
    return colors;
  }, [financeCategories]);
  const groupedRevenueCategories = useMemo(
    () => groupCategoriesBySection('revenue', financeCategories),
    [financeCategories],
  );
  const groupedCostCategories = useMemo(() => groupCategoriesBySection('cost', financeCategories), [financeCategories]);
  const groupedFormCategories = formType === 'revenue' ? groupedRevenueCategories : groupedCostCategories;
  const filteredEventsForCombo = useMemo(() => {
    const unique = new Map<string, (typeof events)[number]>();
    events.forEach((event) => {
      if (event?.id && event.name?.trim()) unique.set(event.id, event);
    });
    const sorted = [...unique.values()].sort((left, right) => compareAlpha(left.name, right.name));
    if (!eventSearch) return sorted;
    const query = eventSearch.toLowerCase();
    return sorted.filter((event) => event.name.toLowerCase().includes(query));
  }, [eventSearch, events]);
  const eventDropdownOptions = useMemo(
    () => [...filteredEventsForCombo].sort((left, right) => compareAlpha(left.name, right.name)),
    [filteredEventsForCombo],
  );
  return {
    categoryLabels,
    categoryColors,
    groupedRevenueCategories,
    groupedCostCategories,
    groupedFormCategories,
    filteredEventsForCombo,
    eventDropdownOptions,
  };
}
