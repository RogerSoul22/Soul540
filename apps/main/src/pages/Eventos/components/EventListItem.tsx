import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge, Heading, type BadgeProps } from '../../../../../../packages/pentagono/src/index';
import { getEventModalityLabel } from '../../../../../../packages/domain/src/index';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { getEventOperationalIssues } from '../../../../../../shared/events/eventInsights';
import styles from '../styles/EventosLista.module.scss';
import { eventValue } from '../support/event-listing';
import { formatBRL } from '../support/event-periods';
import { eventStatusLabels } from '../support/event-status';
import { buildWhatsAppUrl } from '../support/event-whatsapp';
import EventCardActions from './EventCardActions';

type Props = {
  event: PizzaEvent;
  showIssues: boolean;
  onView: (event: PizzaEvent) => void;
  onEdit: (event: PizzaEvent) => void;
  onDelete: (id: string) => void;
  onFinalize: (id: string) => void;
};

const STATUS_BADGE: Record<string, BadgeProps['variant']> = {
  planning: 'blue',
  confirmed: 'amber',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'gray',
};
const SEVERITY_BADGE: Record<string, BadgeProps['variant']> = { danger: 'red', warning: 'amber', info: 'blue' };

export default function EventListItem({ event, showIssues, onView, onEdit, onDelete, onFinalize }: Props) {
  const date = parseISO(event.date);
  const valid = isValid(date);
  const issues = showIssues ? getEventOperationalIssues(event).slice(0, 3) : [];
  const meta = [
    event.time,
    event.city || event.location,
    event.guestCount ? `${event.guestCount} convidados` : '',
  ].filter(Boolean);
  const value = eventValue(event);

  return (
    <article className={styles.item} onClick={() => onView(event)}>
      <div className={styles.itemDate} aria-label={valid ? format(date, "d 'de' MMMM", { locale: ptBR }) : 'Sem data'}>
        <strong>{valid ? format(date, 'dd') : '—'}</strong>
        <span>{valid ? format(date, 'MMM', { locale: ptBR }).replace('.', '') : ''}</span>
        <small>{valid ? format(date, 'EEE', { locale: ptBR }).replace('.', '') : ''}</small>
      </div>
      <div className={styles.itemMain}>
        <div className={styles.itemTitleRow}>
          <Heading level={3} variant="section" className={styles.itemTitle}>
            {event.name}
          </Heading>
          <Badge variant={STATUS_BADGE[event.status] ?? 'gray'}>
            {eventStatusLabels[event.status] ?? event.status}
          </Badge>
          <Badge variant={event.source === 'franchise' ? 'purple' : 'gray'}>
            {event.source === 'franchise' ? 'Itu' : 'Sorocaba'}
          </Badge>
        </div>
        <p className={styles.itemMeta}>{[getEventModalityLabel(event.modality), ...meta].join(' · ')}</p>
        {issues.length > 0 && (
          <div className={styles.itemIssues}>
            {issues.map((issue) => (
              <Badge key={issue.key} variant={SEVERITY_BADGE[issue.severity] ?? 'amber'}>
                {issue.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className={styles.itemSide}>
        <strong className={styles.itemValue}>{value > 0 ? formatBRL(value) : 'Sem valor'}</strong>
        <EventCardActions
          event={event}
          whatsappUrl={buildWhatsAppUrl(event)}
          onEdit={onEdit}
          onDelete={onDelete}
          onFinalize={onFinalize}
          readOnly={event.source === 'franchise'}
        />
      </div>
    </article>
  );
}
