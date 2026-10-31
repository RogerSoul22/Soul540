import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';

export function safeFormatDate(
  date: string | undefined | null,
  fmt: string,
  options?: Parameters<typeof format>[2],
): string {
  if (!date) return '-';
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, fmt, options || { locale: ptBR }) : '-';
}

export function groupByMonth(events: PizzaEvent[]) {
  const months = new Map<string, PizzaEvent[]>();
  for (const event of events) {
    const parsed = parseISO(event.date);
    if (!isValid(parsed)) continue;
    const key = format(parsed, 'yyyy-MM');
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(event);
  }
  return Array.from(months.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, list]) => ({
      key,
      label: format(parseISO(`${key}-01`), 'MMMM yyyy', { locale: ptBR }),
      events: list,
    }));
}
