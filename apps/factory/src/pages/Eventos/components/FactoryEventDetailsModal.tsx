import styles from '../styles/Eventos.module.scss';
import FactoryEventDetailsAdditional from './FactoryEventDetailsAdditional';
import FactoryEventDetailsBasics from './FactoryEventDetailsBasics';
import FactoryEventDetailsDocuments from './FactoryEventDocuments';
import FactoryEventDetailsOperations from './FactoryEventDetailsOperations';
import FactoryEventDetailsProduction from './FactoryEventDetailsProduction';
import type { FactoryEventController } from '../hooks/use-factory-event-controller';

export default function FactoryEventDetailsModal({ controller }: { controller: FactoryEventController }) {
  const { viewingEvent, setViewingEvent, employeeMap } = controller;
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
          <FactoryEventDetailsBasics event={viewingEvent} />
          <FactoryEventDetailsOperations event={viewingEvent} employeeMap={employeeMap} />
          <FactoryEventDetailsProduction controller={controller} />
          <FactoryEventDetailsAdditional event={viewingEvent} />
          <FactoryEventDetailsDocuments event={viewingEvent} />
        </div>
        <div className={styles.modalFooter}>
          <span />
          <button className={styles.btnCancel} onClick={() => setViewingEvent(null)}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
