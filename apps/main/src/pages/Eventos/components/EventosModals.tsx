import { ConfirmModal } from '../../../../../../packages/pentagono/src/index';
import type { EventosController } from '../hooks/use-eventos-controller';
import EventDetailsModal from './EventDetailsModal';
import EventFormModal from './EventFormModal';
import EventosInfoModal from './EventosInfoModal';

// Modais compartilhados pela página inicial e pelas subpáginas de status.
export default function EventosModals({ controller }: { controller: EventosController }) {
  const { deleteTargetId, events, confirmDelete, setDeleteTargetId } = controller;
  const deletedEvent = events.find((event) => event.id === deleteTargetId);

  return (
    <>
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
    </>
  );
}
