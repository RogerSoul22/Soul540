import { format, isValid, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge, Card, Heading } from '../../../../../../packages/pentagono/src/index';
import { buildEventWhatsAppUrl } from '../../../../../../packages/domain/src/index';
import { formatBRL } from '../../../../../../shared/common/currency';
import type { PizzaEvent } from '../../../types/Event';
import EventCardActions from './EventCardActions';
import { eventValue } from '../support/event-listing';
import { getModalityLabel } from '../support/event-modalities';
import styles from '../styles/Eventos.module.scss';

const statusCards = [
  { key: 'orcamentos', label: 'Orçamentos', accent: '#3b82f6', statuses: ['planning'] },
  { key: 'confirmados', label: 'Fechados', accent: '#f59e0b', statuses: ['confirmed', 'in_progress'] },
  { key: 'finalizados', label: 'Finalizados', accent: '#22c55e', statuses: ['completed'] },
  { key: 'cancelados', label: 'Cancelados', accent: '#6b7280', statuses: ['cancelled'] },
] as const;

const statusBadge: Record<string, 'blue' | 'amber' | 'green' | 'gray'> = {
  planning: 'blue',
  confirmed: 'amber',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'gray',
};

const statusLabels: Record<string, string> = {
  planning: 'Orçamento',
  confirmed: 'Fechado',
  in_progress: 'Em andamento',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

function formatCompactBRL(value: number): string {
  const formatNumber = (number: number) => number.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  if (value >= 1_000_000) return `R$ ${formatNumber(value / 1_000_000)} mi`;
  if (value >= 1_000) return `R$ ${formatNumber(value / 1_000)} mil`;
  return `R$ ${formatNumber(value)}`;
}

type Props = {
  events: PizzaEvent[];
  onSelectStatus(key: string): void;
  onView(event: PizzaEvent): void;
  onEdit(event: PizzaEvent): void;
  onDelete(id: string): void;
  onFinalize(id: string): void;
};

export default function EventosOverview({ events, onSelectStatus, onView, onEdit, onDelete, onFinalize }: Props) {
  const regularEvents = events.filter((event) => !event.isRecurringTemplate);
  const upcoming = regularEvents
    .filter((event) => ['planning', 'confirmed', 'in_progress'].includes(event.status))
    .filter((event) => {
      const date = parseISO(event.date);
      return isValid(date) && date >= startOfDay(new Date());
    })
    .sort((left, right) => parseISO(left.date).getTime() - parseISO(right.date).getTime());
  const statusGroups = statusCards.map((card) => {
    const matches = regularEvents.filter((event) => (card.statuses as readonly string[]).includes(event.status));
    const next = matches
      .filter((event) => parseISO(event.date) >= startOfDay(new Date()))
      .sort((left, right) => parseISO(left.date).getTime() - parseISO(right.date).getTime())[0];
    return { ...card, events: matches, total: matches.reduce((sum, event) => sum + eventValue(event), 0), next };
  });

  return (
    <>
      <section className={styles.statusGrid} aria-label="Eventos por status">
        {statusGroups.map((group) => (
          <Card
            key={group.key}
            interactive
            role="link"
            tabIndex={0}
            aria-label={`${group.label}: ${group.events.length} eventos`}
            className={styles.statusCard}
            style={{ ['--status-accent' as string]: group.accent }}
            onClick={() => onSelectStatus(group.key)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectStatus(group.key);
              }
            }}
          >
            <Heading level={2} variant="section" className={styles.statusLabel}>
              {group.label}
            </Heading>
            <strong className={styles.statusCount}>
              {group.events.length}
              <small>{group.events.length === 1 ? 'evento' : 'eventos'}</small>
            </strong>
            <span className={styles.statusTotal}>{formatCompactBRL(group.total)}</span>
            <span className={styles.statusNext}>
              {group.next
                ? `Próximo: ${group.next.name} · ${format(parseISO(group.next.date), "dd 'de' MMM", { locale: ptBR })}`
                : 'Ver lista'}
              <span aria-hidden="true"> ›</span>
            </span>
          </Card>
        ))}
      </section>
      <section className={styles.upcoming} aria-labelledby="franchise-upcoming-events">
        <Heading id="franchise-upcoming-events" level={2} variant="section" className={styles.overviewTitle}>
          Próximos eventos
        </Heading>
        {upcoming.length === 0 ? (
          <p className={styles.overviewEmpty}>Nenhum evento a caminho.</p>
        ) : (
          <div className={styles.upcomingList}>
            {upcoming.map((event) => {
              const date = parseISO(event.date);
              const value = eventValue(event);
              const whatsappUrl = buildEventWhatsAppUrl({
                phone: event.phone,
                name: event.name,
                dateLabel: format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
                time: event.time,
                location: event.location,
                outOfCity: event.outOfCity,
                guestCount: event.guestCount,
                budget: value,
                notes: event.notes,
                includeIcons: false,
              });
              return (
                <article key={event.id} className={styles.upcomingItem} onClick={() => onView(event)}>
                  <div className={styles.upcomingDate}>
                    <strong>{format(date, 'dd')}</strong>
                    <span>{format(date, 'MMM', { locale: ptBR }).replace('.', '')}</span>
                    <small>{format(date, 'EEE', { locale: ptBR }).replace('.', '')}</small>
                  </div>
                  <div className={styles.upcomingMain}>
                    <div className={styles.upcomingTitleRow}>
                      <Heading level={3} variant="section" className={styles.upcomingEventTitle}>
                        {event.name}
                      </Heading>
                      <Badge variant={statusBadge[event.status] ?? 'gray'}>
                        {statusLabels[event.status] ?? event.status}
                      </Badge>
                    </div>
                    <p className={styles.upcomingMeta}>
                      {[getModalityLabel(event.modality), event.time, event.city || event.location,
                        event.guestCount ? `${event.guestCount} convidados` : ''].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className={styles.upcomingSide}>
                    <strong className={styles.upcomingValue}>{value > 0 ? formatBRL(value) : 'Sem valor'}</strong>
                    <EventCardActions
                      event={event}
                      whatsappUrl={whatsappUrl}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onFinalize={onFinalize}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
