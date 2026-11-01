import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Eventos.module.scss';
import EventFormBasics from './EventFormBasics';
import EventFormDocuments from './EventFormDocuments';
import EventFormExtras from './EventFormExtras';
import EventFormFinance from './EventFormFinance';
import EventFormGuests from './EventFormGuests';
import EventFormTeam from './EventFormTeam';
import type { EventFormController } from '../types/event-form-controller';

export default function EventFormModal({ controller }: { controller: EventFormController }) {
  const { showModal, editingId, closeModal, handleSubmit, form } = controller;
  if (!showModal) return null;
  return (
    <Modal title={editingId ? 'Editar Agendamento' : 'Novo Agendamento'} onClose={closeModal} maxWidth={600} flush>
      <div className={styles.modalBody}>
        <EventFormBasics controller={controller} />
        <EventFormTeam controller={controller} />
        <EventFormGuests controller={controller} />
        `n <EventFormFinance controller={controller} />
        <EventFormDocuments controller={controller} />
        <EventFormExtras controller={controller} />
      </div>
      <div className={styles.modalFooter}>
        <Button variant="ghost" onClick={closeModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!form.name || !form.date || !form.location}>
          {editingId ? 'Salvar' : 'Criar Agendamento'}
        </Button>
      </div>
    </Modal>
  );
}
