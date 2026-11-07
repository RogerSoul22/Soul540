import { ConfirmModal, SkeletonContent } from '../../../../../packages/pentagono/src/index';
import { useApp } from '../../contexts/AppContext';
import styles from './styles/Eventos.module.scss';
import EventDetailsModal from './components/EventDetailsModal';
import EventosFilters from './components/EventosFilters';
import EventosHeader from './components/EventosHeader';
import EventosInfoModal from './components/EventosInfoModal';
import EventosSections from './components/EventosSections';
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
      <EventosFilters controller={controller} />
      {dataLoading ? (
        <SkeletonContent variant="list" label="Carregando eventos..." />
      ) : (
        <EventosSections controller={controller} />
      )}
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
