import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
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
    <Modal
      title={viewingEvent.name}
      onClose={() => setViewingEvent(null)}
      closeOnOverlay
      maxWidth={640}
      className={styles.detailModal}
      flush
    >
      <div className={styles.detailBody}>
        <FactoryEventDetailsBasics event={viewingEvent} />
        <FactoryEventDetailsOperations event={viewingEvent} employeeMap={employeeMap} />
        <FactoryEventDetailsProduction controller={controller} />
        <FactoryEventDetailsAdditional event={viewingEvent} />
        <FactoryEventDetailsDocuments event={viewingEvent} />
      </div>
      <div className={styles.modalFooter}>
        <span />
        <Button variant="ghost" onClick={() => setViewingEvent(null)}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
