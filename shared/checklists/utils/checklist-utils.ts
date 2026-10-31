import type { ChecklistItem, EventOption } from '../types';

export function getEventId(event: EventOption) {
  return event.id || event._id || '';
}

export function parseSafeDate(value?: string) {
  if (!value) return null;
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string) {
  const date = parseSafeDate(value);
  if (!date) return 'Sem data';
  return date.toLocaleDateString('pt-BR');
}

export function getEventName(event?: EventOption) {
  if (!event) return 'Checklist geral';
  return event.name || event.celebration || 'Evento sem nome';
}

export function getGuestTotal(event?: EventOption) {
  if (!event) return 0;
  const splitTotal = Number(event.guestsAdult || 0) + Number(event.guestsTeen || 0) + Number(event.guestsChild || 0);
  return Number(event.guestCount || 0) || splitTotal;
}

export function buildStorageKey(scope: string, eventId: string) {
  return `soul540_checklist_envio_${scope}_${eventId || 'geral'}`;
}

export function sortEvents(events: EventOption[]) {
  return [...events].sort((a, b) => {
    const da = parseSafeDate(a.date)?.getTime() || Number.MAX_SAFE_INTEGER;
    const db = parseSafeDate(b.date)?.getTime() || Number.MAX_SAFE_INTEGER;
    if (da !== db) return da - db;
    return getEventName(a).localeCompare(getEventName(b), 'pt-BR');
  });
}

export function buildItem(text: string): ChecklistItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
  };
}
