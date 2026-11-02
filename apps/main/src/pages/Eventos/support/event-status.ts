import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import type { EventGroups } from './event-listing';

export type EventStatusKey = keyof EventGroups;

export interface EventStatusPage {
  slug: string;
  key: EventStatusKey;
  label: string;
  singular: string;
  accent: string;
  // Eventos que ainda vão acontecer: a lista começa pelos mais próximos.
  upcoming: boolean;
}

export const EVENT_STATUS_PAGES: EventStatusPage[] = [
  {
    slug: 'orcamentos',
    key: 'orcamentos',
    label: 'Orçamentos',
    singular: 'orçamento',
    accent: '#3b82f6',
    upcoming: true,
  },
  {
    slug: 'fechados',
    key: 'confirmados',
    label: 'Fechados',
    singular: 'evento fechado',
    accent: '#f59e0b',
    upcoming: true,
  },
  {
    slug: 'finalizados',
    key: 'finalizados',
    label: 'Finalizados',
    singular: 'evento finalizado',
    accent: '#22c55e',
    upcoming: false,
  },
  {
    slug: 'cancelados',
    key: 'cancelados',
    label: 'Cancelados',
    singular: 'evento cancelado',
    accent: '#6b7280',
    upcoming: false,
  },
];

export const findEventStatusPage = (slug: string | undefined) => EVENT_STATUS_PAGES.find((page) => page.slug === slug);

export const eventStatusPath = (slug: string) => `/eventos/${slug}`;

// Agrupa todos os eventos (sem filtro) por status, para os cartões da página inicial.
export function groupEventsByStatus(events: PizzaEvent[]): EventGroups {
  return {
    orcamentos: events.filter((event) => event.status === 'planning'),
    confirmados: events.filter((event) => event.status === 'confirmed' || event.status === 'in_progress'),
    finalizados: events.filter((event) => event.status === 'completed'),
    cancelados: events.filter((event) => event.status === 'cancelled'),
  };
}

export const eventStatusLabels: Record<string, string> = {
  planning: 'Orçamento',
  confirmed: 'Fechado',
  in_progress: 'Em andamento',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};
