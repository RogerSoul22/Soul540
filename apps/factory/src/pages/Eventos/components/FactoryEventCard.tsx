import { Card, Heading } from '../../../../../../packages/pentagono/src/index';
import { buildEventWhatsAppUrl as buildSharedEventWhatsAppUrl } from '../../../../../../packages/domain/src/index';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { ptBR } from 'date-fns/locale';
import { safeFormatDate } from '../support/event-formatters';
import { whatsappIconPath } from '../support/factory-event-icons';
import styles from '../styles/Eventos.module.scss';
function buildWhatsAppUrl(ev: PizzaEvent): string {
  return buildSharedEventWhatsAppUrl({
    phone: ev.phone,
    name: ev.name,
    dateLabel: safeFormatDate(ev.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    time: ev.time,
    location: ev.location,
    outOfCity: ev.outOfCity,
    guestCount: ev.guestCount,
    budget: ev.finalValue ?? ev.budget ?? 0,
    notes: ev.notes,
    includeIcons: false,
  });
}
function EventCard({
  ev,
  employeeMap,
  onView,
}: {
  ev: PizzaEvent;
  employeeMap: Record<string, string>;
  onView: (ev: PizzaEvent) => void;
}) {
  const isFranchise = (ev as any).source === 'franchise';
  return (
    <Card className={styles.card} interactive onClick={() => onView(ev)}>
      <div className={styles.cardTop}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <Heading level={3} variant="section" className={styles.cardTitle} style={{ margin: 0 }}>
              {ev.name}
            </Heading>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 10,
                background: isFranchise ? '#7c3aed22' : '#0369a122',
                color: isFranchise ? '#7c3aed' : '#0369a1',
                textTransform: 'uppercase',
                letterSpacing: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {isFranchise ? 'Franquia' : 'Principal'}
            </span>
          </div>
          <p className={styles.cardSub}>
            {safeFormatDate(ev.date, "dd 'de' MMM, yyyy", { locale: ptBR })}
            {ev.endDate && ` → ${safeFormatDate(ev.endDate, "dd 'de' MMM", { locale: ptBR })}`}
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
          {ev.guestCount} convidados{ev.staffCount ? ` · ${ev.staffCount} funcionários` : ''}
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
          R$ {(ev.finalValue ?? ev.budget ?? 0).toLocaleString('pt-BR')}
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
      {ev.notes && <p className={styles.cardNotes}>{ev.notes}</p>}
      <div className={styles.cardActions}>
        {ev.phone && (
          <a
            className={styles.btnWhatsapp}
            href={buildWhatsAppUrl(ev)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="WhatsApp"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d={whatsappIconPath} />
            </svg>
          </a>
        )}
      </div>
    </Card>
  );
}

export default EventCard;
