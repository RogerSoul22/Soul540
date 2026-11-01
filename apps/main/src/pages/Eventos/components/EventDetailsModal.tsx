import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { Dispatch, SetStateAction } from 'react';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
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
    <Modal
      title={viewingEvent.name}
      onClose={() => setViewingEvent(null)}
      closeOnOverlay
      maxWidth={640}
      className={styles.detailModal}
      flush
    >
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
        <Button variant="ghost" onClick={() => setViewingEvent(null)}>
          Fechar
        </Button>
        {viewingEvent.source !== 'franchise' && (
          <Button
            variant="primary"
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
          </Button>
        )}
      </div>
    </Modal>
  );
}
