import { ptBR } from 'date-fns/locale';
import { buildEventWhatsAppUrl } from '../../../../../../packages/domain/src/index';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { eventValue } from './event-listing';
import { safeFormat } from './event-formatters';

export function buildWhatsAppUrl(event: PizzaEvent): string {
  return buildEventWhatsAppUrl({
    phone: event.phone,
    name: event.name,
    dateLabel: safeFormat(event.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    time: event.time,
    location: event.location,
    outOfCity: event.outOfCity,
    guestCount: event.guestCount,
    budget: eventValue(event),
    notes: event.notes,
    includeIcons: false,
  });
}
