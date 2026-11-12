import { format, isValid, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Card,
  EmptyState,
  Heading,
  SkeletonContent,
  SkeletonValue,
} from '../../../../../../packages/pentagono/src/index';
import { buildEventWhatsAppUrl } from '../../../../../../packages/domain/src/index';
import { formatBRL } from '../../../../../../shared/common/currency';
import type { PizzaEvent } from '../../../types/Event';
import EventCardActions from './EventCardActions';
import { eventValue } from '../support/event-listing';
import { getModalityLabel } from '../support/event-modalities';
import { EVENT_STATUS_PAGES, eventStatusPath } from '../support/event-status';
import styles from '../styles/Eventos.module.scss';

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
  loading: boolean;
  onView(event: PizzaEvent): void;
  onEdit(event: PizzaEvent): void;
  onDelete(id: string): void;
  onFinalize(id: string): void;
};

export default function EventosOverview({ events, loading, onView, onEdit, onDelete, onFinalize }: Props) {
  const navigate = useNavigate();
  const regularEvents = events.filter((event) => !event.isRecurringTemplate);
  const upcoming = regularEvents
    .filter((event) => ['planning', 'confirmed', 'in_progress'].includes(event.status))
    .filter((event) => {
      const date = parseISO(event.date);
      return isValid(date) && date >= startOfDay(new Date());
    })
    .sort((left, right) => parseISO(left.date).getTime() - parseISO(right.date).getTime());
  const statusGroups = EVENT_STATUS_PAGES.map((page) => {
    const matches = regularEvents.filter((event) => page.statuses.includes(event.status));
    const next = page.upcoming
      ? matches
          .filter((event) => parseISO(event.date) >= startOfDay(new Date()))
          .sort((left, right) => parseISO(left.date).getTime() - parseISO(right.date).getTime())[0]
      : undefined;
    return { ...page, events: matches, total: matches.reduce((sum, event) => sum + eventValue(event), 0), next };
  });

  return (
    <>
      <section className={styles.statusGrid} aria-label="Eventos por status">
        {statusGroups.map((group) => (
          <Card
            key={group.slug}
            interactive
            role="link"
            tabIndex={0}
            aria-label={`${group.label}: ${group.events.length} eventos`}
            className={styles.statusCard}
            style={{ ['--status-accent' as string]: group.accent }}
            onClick={() => navigate(eventStatusPath(group.slug))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(eventStatusPath(group.slug));
              }
            }}
          >
            <Heading level={2} variant="section" className={styles.statusLabel}>
              {group.label}
            </Heading>
            <strong className={styles.statusCount}>
              <SkeletonValue loading={loading} label={`Carregando ${group.label}`}>
                {group.events.length}
              </SkeletonValue>
              <small>{group.events.length === 1 ? 'evento' : 'eventos'}</small>
            </strong>
            <span className={styles.statusTotal}>
              <SkeletonValue loading={loading} label="Carregando valor">
                {formatCompactBRL(group.total)}
              </SkeletonValue>
            </span>
            {group.next && (
              <span className={styles.statusNext}>
                Próximo: {group.next.name} · {format(parseISO(group.next.date), "dd 'de' MMM", { locale: ptBR })}
              </span>
            )}
          </Card>
        ))}
      </section>
      <section className={styles.upcoming} aria-labelledby="eventos-proximos">
        <Heading id="eventos-proximos" level={2} variant="section" className={styles.overviewTitle}>
          Próximos eventos
        </Heading>
        {loading ? (
          <SkeletonContent variant="list" label="Carregando eventos..." />
        ) : upcoming.length === 0 ? (
          <EmptyState
            variant="compact"
            title="Nenhum evento a caminho."
            description="Crie um evento para começar."
          />
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
