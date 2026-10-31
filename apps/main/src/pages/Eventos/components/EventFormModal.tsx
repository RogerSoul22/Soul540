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
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
          <button className={styles.modalClose} onClick={closeModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <EventFormBasics controller={controller} />
          <EventFormTeam controller={controller} />
          <EventFormGuests controller={controller} />
          `n <EventFormFinance controller={controller} />
          <EventFormDocuments controller={controller} />
          <EventFormExtras controller={controller} />
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={closeModal}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={!form.name || !form.date || !form.location}
          >
            {editingId ? 'Salvar' : 'Criar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
