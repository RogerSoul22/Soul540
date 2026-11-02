import { addWeeks, format, isSameDay, isSameWeek, isValid, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { eventValue } from './event-listing';

export interface PeriodGroup {
  key: string;
  label: string;
  events: PizzaEvent[];
  total: number;
}

const WEEK = { weekStartsOn: 1 as const };
const timeOf = (event: PizzaEvent) => {
  const date = parseISO(event.date);
  return isValid(date) ? date.getTime() : 0;
};

function bucketOf(event: PizzaEvent, now: Date): { key: string; label: string; order: number } {
  const date = parseISO(event.date);
  if (!isValid(date)) return { key: 'sem-data', label: 'Sem data', order: 9_999 };
  if (date < startOfDay(now)) return { key: 'atrasados', label: 'Atrasados', order: 0 };
  if (isSameDay(date, now)) return { key: 'hoje', label: 'Hoje', order: 1 };
  if (isSameWeek(date, now, WEEK)) return { key: 'semana', label: 'Esta semana', order: 2 };
  if (isSameWeek(date, addWeeks(now, 1), WEEK)) return { key: 'proxima', label: 'Próxima semana', order: 3 };
  const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
  return { key: format(date, 'yyyy-MM'), label: label.charAt(0).toUpperCase() + label.slice(1), order: 10 };
}

// Eventos futuros: atrasados, hoje, esta semana, próxima semana e depois mês a mês (do mais próximo ao mais
// distante). Eventos passados: mês a mês, do mais recente ao mais antigo.
export function groupEventsByPeriod(events: PizzaEvent[], upcoming: boolean, now = new Date()): PeriodGroup[] {
  const sorted = [...events].sort((left, right) => (upcoming ? 1 : -1) * (timeOf(left) - timeOf(right)));
  const groups = new Map<string, PeriodGroup & { order: number }>();

  for (const event of sorted) {
    const bucket = upcoming
      ? bucketOf(event, now)
      : (() => {
          const date = parseISO(event.date);
          const label = isValid(date) ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : 'Sem data';
          return {
            key: isValid(date) ? format(date, 'yyyy-MM') : 'sem-data',
            label: label.charAt(0).toUpperCase() + label.slice(1),
            order: 0,
          };
        })();
    const group = groups.get(bucket.key) ?? { ...bucket, events: [], total: 0 };
    group.events.push(event);
    group.total += eventValue(event);
    groups.set(bucket.key, group);
  }

  const list = [...groups.values()];
  return upcoming ? list.sort((left, right) => left.order - right.order || left.key.localeCompare(right.key)) : list;
}

// R$ 91,7 mil · R$ 1,2 mi · R$ 850
export function formatCompactBRL(value: number): string {
  const format1 = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  if (value >= 1_000_000) return `R$ ${format1(value / 1_000_000)} mi`;
  if (value >= 1_000) return `R$ ${format1(value / 1_000)} mil`;
  return `R$ ${format1(value)}`;
}

export const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const OPEN_STATUSES = new Set(['planning', 'confirmed', 'in_progress']);

// Eventos que ainda vão acontecer (orçamentos e fechados), do mais próximo ao mais distante.
export function upcomingEvents(events: PizzaEvent[], now = new Date()): PizzaEvent[] {
  return events
    .filter((event) => OPEN_STATUSES.has(event.status) && timeOf(event) >= startOfDay(now).getTime())
    .sort((left, right) => timeOf(left) - timeOf(right));
}
