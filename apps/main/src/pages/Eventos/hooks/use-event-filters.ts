import { useMemo, useState } from 'react';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { normalizeEventModality, normalizeTextPtBr as normalizeStr } from '../../../../../../packages/domain/src/index';
import type { EventGroups } from '../support/event-listing';

export function useEventFilters(events: PizzaEvent[]) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'main' | 'franchise'>('all');
  const [modalityFilter, setModalityFilter] = useState<'all' | 'feirinha' | 'evento_avulso'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<'date' | 'month'>('date');
  const filtered = useMemo<EventGroups>(() => {
    const matching = events
      .filter(
        (event) =>
          sourceFilter === 'all' ||
          (sourceFilter === 'main' ? !event.source || event.source === 'main' : event.source === 'franchise'),
      )
      .filter((event) => modalityFilter === 'all' || normalizeEventModality(event.modality) === modalityFilter)
      .filter(
        (event) =>
          !search ||
          normalizeStr(event.name).includes(normalizeStr(search)) ||
          normalizeStr(event.location).includes(normalizeStr(search)) ||
          (event.city && normalizeStr(event.city).includes(normalizeStr(search))),
      )
      .filter((event) => !dateFilter || (event.date && event.date.startsWith(dateFilter)))
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
    return {
      orcamentos: matching.filter((event) => event.status === 'planning'),
      confirmados: matching.filter((event) => event.status === 'confirmed' || event.status === 'in_progress'),
      finalizados: matching.filter((event) => event.status === 'completed'),
      cancelados: matching.filter((event) => event.status === 'cancelled'),
    };
  }, [events, search, sourceFilter, modalityFilter, dateFilter]);
  return {
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    modalityFilter,
    setModalityFilter,
    dateFilter,
    setDateFilter,
    dateFilterMode,
    setDateFilterMode,
    filtered,
  };
}
