import { useMemo } from 'react';
import type { Supply, SupplyStatus } from '../types/supply-types';

export function useSuppliesDerived(
  supplies: Supply[],
  search: string,
  statusFilter: 'all' | SupplyStatus,
  selectedCategory: string | null,
) {
  const query = search.toLowerCase();
  const filtered = useMemo(
    () =>
      supplies.filter(
        (supply) =>
          (!query || supply.name.toLowerCase().includes(query) || supply.category.toLowerCase().includes(query)) &&
          (statusFilter === 'all' || supply.status === statusFilter) &&
          (!selectedCategory || supply.category === selectedCategory),
      ),
    [query, selectedCategory, statusFilter, supplies],
  );
  const lowStockCount = supplies.filter(
    (supply) => supply.status === 'estoque_baixo' || supply.status === 'sem_estoque',
  ).length;
  const totalValue = supplies.reduce((total, supply) => total + supply.quantity * supply.costPerUnit, 0);
  return { filtered, lowStockCount, totalValue };
}
