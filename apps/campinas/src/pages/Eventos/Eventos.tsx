import { useApp } from '../../contexts/AppContext';
import styles from './styles/Eventos.module.scss';
import EventosHeader from './components/EventosHeader';
import EventosModals from './components/EventosModals';
import EventosOverview from './components/EventosOverview';
import { useEventosController } from './hooks/use-eventos-controller';

export default function Eventos() {
  const controller = useEventosController();
  const { dataLoading } = useApp();
  return (
    <div className={styles.page}>
      <EventosHeader controller={controller} />
      <EventosOverview
        events={controller.events}
        loading={dataLoading}
        onView={controller.setViewingEvent}
        onEdit={controller.openEdit}
        onDelete={controller.setDeleteTargetId}
        onFinalize={(id) => controller.updateEvent(id, { status: 'completed' })}
      />
      <EventosModals controller={controller} />
    </div>
  );
}
