import { ConfirmModal } from '../../../../../packages/pentagono/src/index';
import { useApp } from '../../contexts/AppContext';
import styles from './styles/Eventos.module.scss';
import EventDetailsModal from './components/EventDetailsModal';
import EventosHeader from './components/EventosHeader';
import EventosInfoModal from './components/EventosInfoModal';
import EventosOverview from './components/EventosOverview';
import EventFormModal from './components/EventFormModal';
import { useEventosController } from './hooks/use-eventos-controller';

export default function Eventos() {
  const controller = useEventosController();
  const { dataLoading } = useApp();
  const { deleteTargetId, events, confirmDelete, setDeleteTargetId } = controller;
  const deletedEvent = events.find((event) => event.id === deleteTargetId);
  return (
    <div className={styles.page}>
      <EventosHeader controller={controller} />
      <EventosOverview
        events={events}
        loading={dataLoading}
        onView={controller.setViewingEvent}
        onEdit={controller.openEdit}
        onDelete={controller.setDeleteTargetId}
        onFinalize={(id) => controller.updateEvent(id, { status: 'completed' })}
      />
      <EventFormModal controller={controller} />
      <EventDetailsModal controller={controller} />
      <EventosInfoModal controller={controller} />
      {deleteTargetId && (
        <ConfirmModal
          title="Excluir Evento"
          message={
            <>
              <span>Tem certeza que deseja excluir </span>
              <strong>{deletedEvent?.name}</strong>
              <span>? Esta acao nao pode ser desfeita.</span>
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={confirmDelete}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
