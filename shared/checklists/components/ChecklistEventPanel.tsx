import styles from '../styles/ChecklistEnvioPage.module.scss';
import type { ChecklistMeta, EventOption } from '../types';
import { formatDate, getEventId, getEventName } from '../utils/checklist-utils';

type Props = {
  events: EventOption[];
  loading: boolean;
  meta: ChecklistMeta[];
  selectedEventId: string;
  onSelect: (eventId: string) => void;
};

export function ChecklistEventPanel({ events, loading, meta, selectedEventId, onSelect }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelBody}>
        <label className={styles.label} htmlFor="event-select">Evento</label>
        <select
          id="event-select"
          className={styles.select}
          value={selectedEventId}
          onChange={(event) => onSelect(event.target.value)}
          disabled={loading || events.length === 0}
        >
          {loading && <option>Carregando eventos...</option>}
          {!loading && events.length === 0 && <option value="">Nenhum evento encontrado</option>}
          {!loading && events.map((event) => {
            const id = getEventId(event);
            return <option key={id} value={id}>{formatDate(event.date)} - {getEventName(event)}</option>;
          })}
        </select>
        <div className={styles.eventMeta}>
          {meta.map((item) => (
            <div className={styles.metaItem} key={item.label}>
              <span className={styles.metaLabel}>{item.label}</span>
              <span className={styles.metaValue} title={item.value}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
