import styles from './styles/Eventos.module.scss';
import FactoryEventDetailsModal from './components/FactoryEventDetailsModal';
import FactoryEventsInfoModal from './components/FactoryEventsInfoModal';
import FactoryEventsList from './components/FactoryEventsList';
import { useFactoryEventController } from './hooks/use-factory-event-controller';

export default function Eventos() {
  const controller = useFactoryEventController();
  return (
    <div className={styles.page}>
      <FactoryEventsList controller={controller} />
      <FactoryEventDetailsModal controller={controller} />
      <FactoryEventsInfoModal controller={controller} />
    </div>
  );
}
