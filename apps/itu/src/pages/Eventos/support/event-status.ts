import type { EventGroups } from './event-listing';

export type EventStatusKey = Exclude<keyof EventGroups, 'recurringTemplates'>;

export interface EventStatusPage {
  slug: string;
  key: EventStatusKey;
  label: string;
  singular: string;
  accent: string;
  statuses: readonly string[];
  upcoming: boolean;
}

export const EVENT_STATUS_PAGES: EventStatusPage[] = [
  {
    slug: 'orcamentos',
    key: 'orcamentos',
    label: 'Orçamentos',
    singular: 'orçamento',
    accent: '#3b82f6',
    statuses: ['planning'],
    upcoming: true,
  },
  {
    slug: 'fechados',
    key: 'confirmados',
    label: 'Fechados',
    singular: 'evento fechado',
    accent: '#f59e0b',
    statuses: ['confirmed', 'in_progress'],
    upcoming: true,
  },
  {
    slug: 'finalizados',
    key: 'finalizados',
    label: 'Finalizados',
    singular: 'evento finalizado',
    accent: '#22c55e',
    statuses: ['completed'],
    upcoming: false,
  },
  {
    slug: 'cancelados',
    key: 'cancelados',
    label: 'Cancelados',
    singular: 'evento cancelado',
    accent: '#6b7280',
    statuses: ['cancelled'],
    upcoming: false,
  },
];

export const findEventStatusPage = (slug: string | undefined) => EVENT_STATUS_PAGES.find((page) => page.slug === slug);
export const eventStatusPath = (slug: string) => `/eventos/${slug}`;
