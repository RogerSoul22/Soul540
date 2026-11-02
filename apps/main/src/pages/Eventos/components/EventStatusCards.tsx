import { format, isValid, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Card, Heading, SkeletonValue } from '../../../../../../packages/pentagono/src/index';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import styles from '../styles/EventosOverview.module.scss';
import { eventValue } from '../support/event-listing';
import { formatCompactBRL } from '../support/event-periods';
import { EVENT_STATUS_PAGES, eventStatusPath, groupEventsByStatus } from '../support/event-status';

function nextEvent(events: PizzaEvent[], today: Date) {
  return [...events]
    .filter((event) => isValid(parseISO(event.date)) && parseISO(event.date) >= startOfDay(today))
    .sort((left, right) => parseISO(left.date).getTime() - parseISO(right.date).getTime())[0];
}

// Os quatro status viram cartões: cada um abre a própria subpágina com a lista daquele status.
export default function EventStatusCards({ events, loading }: { events: PizzaEvent[]; loading: boolean }) {
  const navigate = useNavigate();
  const groups = groupEventsByStatus(events);
  const today = new Date();

  return (
    <section className={styles.statusGrid} aria-label="Eventos por status">
      {EVENT_STATUS_PAGES.map((page) => {
        const list = groups[page.key];
        const total = list.reduce((sum, event) => sum + eventValue(event), 0);
        const next = page.upcoming ? nextEvent(list, today) : undefined;
        return (
          <Card
            key={page.slug}
            interactive
            role="link"
            tabIndex={0}
            aria-label={`${page.label}: ${list.length} eventos`}
            className={styles.statusCard}
            style={{ ['--status-accent' as string]: page.accent }}
            onClick={() => navigate(eventStatusPath(page.slug))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(eventStatusPath(page.slug));
              }
            }}
          >
            <Heading level={2} variant="section" className={styles.statusLabel}>
              {page.label}
            </Heading>
            <strong className={styles.statusCount}>
              <SkeletonValue loading={loading} label={`Carregando ${page.label}`}>
                {list.length}
              </SkeletonValue>
              <small>{list.length === 1 ? 'evento' : 'eventos'}</small>
            </strong>
            <span className={styles.statusTotal}>
              <SkeletonValue loading={loading} label="Carregando valor">
                {formatCompactBRL(total)}
              </SkeletonValue>
            </span>
            <span className={styles.statusNext}>
              {next
                ? `Próximo: ${next.name} · ${format(parseISO(next.date), "dd 'de' MMM", { locale: ptBR })}`
                : 'Ver lista'}
              <span aria-hidden="true"> ›</span>
            </span>
          </Card>
        );
      })}
    </section>
  );
}
