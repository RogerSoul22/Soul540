import { useMemo, useState } from 'react';
import type { PizzaEvent } from '../../../types/Event';
import { normalizeEventModality, normalizeTextPtBr as normalizeStr } from '../../../../../../packages/domain/src/index';
import type { EventGroups } from '../support/event-listing';

export function useEventFilters(events: PizzaEvent[]) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'main' | 'franchise'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<'date' | 'month'>('date');
  const [modalityFilter, setModalityFilter] = useState<'all' | 'feirinha' | 'evento_avulso'>('all');
  const filtered = useMemo<EventGroups>(() => {
    const matching = events
      .filter(
        (event) =>
          sourceFilter === 'all' ||
          (sourceFilter === 'main' ? !event.source || event.source === 'main' : event.source === 'franchise'),
      )
      .filter(
        (event) =>
          !search ||
          normalizeStr(event.name).includes(normalizeStr(search)) ||
          normalizeStr(event.location).includes(normalizeStr(search)) ||
          (event.city && normalizeStr(event.city).includes(normalizeStr(search))),
      )
      .filter((event) => modalityFilter === 'all' || normalizeEventModality(event.modality) === modalityFilter)
      .filter((event) => !dateFilter || (event.date && event.date.startsWith(dateFilter)))
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
    const regularEvents = matching.filter((event) => !event.isRecurringTemplate);
    return {
      recurringTemplates: matching.filter((event) => event.isRecurringTemplate),
      orcamentos: regularEvents.filter((event) => event.status === 'planning'),
      confirmados: regularEvents.filter((event) => event.status === 'confirmed' || event.status === 'in_progress'),
      finalizados: regularEvents.filter((event) => event.status === 'completed'),
      cancelados: regularEvents.filter((event) => event.status === 'cancelled'),
    };
  }, [events, search, sourceFilter, dateFilter, modalityFilter]);
  return {
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    dateFilter,
    setDateFilter,
    dateFilterMode,
    setDateFilterMode,
    modalityFilter,
    setModalityFilter,
    filtered,
  };
}
