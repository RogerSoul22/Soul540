import { SkeletonContent } from '../../../../../packages/pentagono/src/index';
import { useApp } from '../../contexts/AppContext';
import styles from './styles/Eventos.module.scss';
import FactoryEventDetailsModal from './components/FactoryEventDetailsModal';
import FactoryEventsInfoModal from './components/FactoryEventsInfoModal';
import FactoryEventsList from './components/FactoryEventsList';
import { useFactoryEventController } from './hooks/use-factory-event-controller';

export default function Eventos() {
  const controller = useFactoryEventController();
  const { dataLoading } = useApp();
  return (
    <div className={styles.page}>
      {dataLoading ? (
        <SkeletonContent variant="list" label="Carregando eventos..." />
      ) : (
        <FactoryEventsList controller={controller} />
      )}
      <FactoryEventDetailsModal controller={controller} />
      <FactoryEventsInfoModal controller={controller} />
    </div>
  );
}
