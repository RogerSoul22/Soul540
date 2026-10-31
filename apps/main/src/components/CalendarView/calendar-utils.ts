import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  parseISO,
} from 'date-fns';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { buildEventWhatsAppUrl as buildSharedEventWhatsAppUrl } from '../../../../../packages/domain/src/index';
import type { PizzaEvent } from '../../../../../packages/contracts/src/index';

export const EVENT_COLOR = {
  bg: 'rgba(245,158,11,0.14)',
  text: '#f59e0b',
  border: 'rgba(245,158,11,0.28)',
  solid: '#f59e0b',
};
export const PLANNING_COLOR = {
  bg: 'rgba(59,130,246,0.12)',
  text: '#3b82f6',
  border: 'rgba(59,130,246,0.28)',
  solid: '#3b82f6',
};
export const COMPLETED_COLOR = {
  bg: 'rgba(34,197,94,0.12)',
  text: '#22c55e',
  border: 'rgba(34,197,94,0.28)',
  solid: '#22c55e',
};
export const NOTES_COLOR = {
  bg: 'rgba(239,68,68,0.12)',
  text: '#ef4444',
  border: 'rgba(239,68,68,0.28)',
  solid: '#ef4444',
};
export const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const HOURS = Array.from({ length: 16 }, (_, index) => index + 7);
export const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function getEventColor(event: PizzaEvent) {
  if (event.status === 'completed') return COMPLETED_COLOR;
  if (event.notes?.trim()) return NOTES_COLOR;
  if (event.status === 'planning') return PLANNING_COLOR;
  return EVENT_COLOR;
}

export function getCalendarDays(month: Date) {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
  });
}

export function getEventsForDay(events: PizzaEvent[], day: Date) {
  const currentDay = startOfDay(day);
  return events.filter((event) => {
    const start = startOfDay(parseISO(event.date));
    const end = event.endDate ? startOfDay(parseISO(event.endDate)) : start;
    return currentDay >= start && currentDay <= end;
  });
}

export function isEventStart(event: PizzaEvent, day: Date) {
  return isSameDay(parseISO(event.date), day);
}

export function buildWhatsAppUrl(event: PizzaEvent) {
  return buildSharedEventWhatsAppUrl({
    phone: event.phone,
    name: event.name,
    dateLabel: format(parseISO(event.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    time: event.time,
    location: event.location,
    outOfCity: event.outOfCity,
    guestCount: event.guestCount,
    budget: event.budget,
    notes: event.notes,
  });
}
