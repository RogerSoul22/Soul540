import { ptBR } from 'date-fns/locale';
import type { PizzaEvent } from '@soul540/contracts';
import { safeFormat } from './event-formatters';

export type EventGroups = {
  orcamentos: PizzaEvent[];
  confirmados: PizzaEvent[];
  finalizados: PizzaEvent[];
  cancelados: PizzaEvent[];
};

export function groupByMonth(events: PizzaEvent[]) {
  const months = new Map<string, PizzaEvent[]>();
  events.forEach((event) => {
    const key = safeFormat(event.date, 'yyyy-MM');
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(event);
  });
  return Array.from(months.entries())
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([key, list]) => ({
      key,
      label: safeFormat(list[0].date, 'MMMM • yyyy', { locale: ptBR }),
      events: list,
    }));
}

export function eventValue(event: PizzaEvent): number {
  return event.finalValue && event.finalValue > 0 ? event.finalValue : event.budget;
}
