import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { buildEventWhatsAppUrl as buildSharedEventWhatsAppUrl } from '../../../../../../packages/domain/src/index';
import EventCardActions from './EventCardActions';
import type { PizzaEvent } from '../../../types/Event';
import styles from '../styles/Eventos.module.scss';
import { getModalityLabel } from '../support/event-modalities';
function safeFormat(date: string | undefined | null, fmt: string, options?: Parameters<typeof format>[2]): string {
  if (!date) return '—';
  const d = parseISO(date);
  return isValid(d) ? format(d, fmt, options) : '—';
}
function buildWhatsAppUrl(ev: PizzaEvent): string {
  const value = ev.finalValue && ev.finalValue > 0 ? ev.finalValue : ev.budget;
  return buildSharedEventWhatsAppUrl({
    phone: ev.phone,
    name: ev.name,
    dateLabel: safeFormat(ev.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    time: ev.time,
    location: ev.location,
    outOfCity: ev.outOfCity,
    guestCount: ev.guestCount,
    budget: value,
    notes: ev.notes,
    includeIcons: false,
  });
}
function EventCard({
  ev,
  employeeMap,
  onView,
  onEdit,
  onDelete,
  onFinalize,
}: {
  ev: PizzaEvent;
  employeeMap: Record<string, string>;
  onView: (ev: PizzaEvent) => void;
  onEdit: (ev: PizzaEvent) => void;
  onDelete: (id: string) => void;
  onFinalize: (id: string) => void;
}) {
  const statusClass =
    ev.status === 'completed'
      ? styles.cardGreen
      : ev.notes?.trim()
        ? styles.cardRed
        : ev.status === 'planning'
          ? styles.cardBlue
          : styles.cardYellow;
  return (
    <div className={`${styles.card} ${statusClass}`} onClick={() => onView(ev)}>
      <div className={styles.cardTop}>
        <div>
          <h3 className={styles.cardTitle}>{ev.name}</h3>
          <span className={styles.modalityBadge}>{getModalityLabel(ev.modality)}</span>
          <p className={styles.cardSub}>
            {safeFormat(ev.date, "dd 'de' MMM, yyyy", { locale: ptBR })}
            {ev.endDate && ` → ${safeFormat(ev.endDate, "dd 'de' MMM", { locale: ptBR })}`}
            {ev.time && ` · ${ev.time}`}
          </p>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardRow}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {ev.location}
          {ev.outOfCity && ' (fora da cidade)'}
        </div>
        <div className={styles.cardRow}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {ev.guestCount} convidados
          {ev.staffCount ? ` · ${ev.staffCount} funcionários` : ''}
        </div>
        <div className={styles.cardRow}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          R$ {(ev.finalValue && ev.finalValue > 0 ? ev.finalValue : ev.budget).toLocaleString('pt-BR')}
        </div>
        {ev.responsibleEmployeeId && (
          <div className={styles.cardRow}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Resp: {employeeMap[ev.responsibleEmployeeId] || ev.responsibleEmployeeId}
          </div>
        )}
      </div>
      {ev.notes && <p className={`${styles.cardNotes} ${styles.cardNotesHighlight}`}>{ev.notes}</p>}
      <EventCardActions
        event={ev}
        whatsappUrl={buildWhatsAppUrl(ev)}
        onEdit={onEdit}
        onDelete={onDelete}
        onFinalize={onFinalize}
      />
    </div>
  );
}
export default EventCard;
