import type { Dispatch, SetStateAction } from 'react';
import type { PizzaEvent } from '@soul540/contracts';
import styles from '../styles/Eventos.module.scss';
import EventDetailsBasics from './EventDetailsBasics';
import EventDetailsDocuments from './EventDetailsDocuments';
import EventDetailsTeam from './EventDetailsTeam';

type EventDetailsController = {
  viewingEvent: PizzaEvent | null;
  setViewingEvent: Dispatch<SetStateAction<PizzaEvent | null>>;
  employeeMap: Record<string, string>;
  openEdit: (event: PizzaEvent) => void;
};

export default function EventDetailsModal({ controller }: { controller: EventDetailsController }) {
  const { viewingEvent, setViewingEvent, employeeMap, openEdit } = controller;
  if (!viewingEvent) return null;
  return (
    <div className={styles.overlay} onClick={() => setViewingEvent(null)}>
      <div className={styles.detailModal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{viewingEvent.name}</h2>
          <button className={styles.modalClose} onClick={() => setViewingEvent(null)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.detailBody}>
          <EventDetailsBasics event={viewingEvent} />
          <EventDetailsTeam event={viewingEvent} employeeMap={employeeMap} />
          <EventDetailsDocuments event={viewingEvent} />
          {viewingEvent.createdBy && (
            <div className={styles.detailSection}>
              <p className={styles.detailSectionTitle}>Criado por</p>
              <p className={styles.detailValue}>{viewingEvent.createdBy}</p>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={() => setViewingEvent(null)}>
            Fechar
          </button>
          {viewingEvent.source !== 'franchise' && (
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setViewingEvent(null);
                openEdit(viewingEvent);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
