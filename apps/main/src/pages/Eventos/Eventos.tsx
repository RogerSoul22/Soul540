import { EmptyState, Heading, SkeletonContent } from '../../../../../packages/pentagono/src/index';
import { useApp } from '../../contexts/AppContext';
import EventListItem from './components/EventListItem';
import EventStatusCards from './components/EventStatusCards';
import EventosHeader from './components/EventosHeader';
import EventosModals from './components/EventosModals';
import { useEventosController } from './hooks/use-eventos-controller';
import lista from './styles/EventosLista.module.scss';
import styles from './styles/EventosOverview.module.scss';
import { upcomingEvents } from './support/event-periods';

const UPCOMING_LIMIT = 6;

export default function Eventos() {
  const controller = useEventosController();
  const { dataLoading } = useApp();
  const { events, openEdit, setViewingEvent, setDeleteTargetId, updateEvent } = controller;
  const upcoming = upcomingEvents(events).slice(0, UPCOMING_LIMIT);

  return (
    <div className={styles.page}>
      <EventosHeader controller={controller} />
      <EventStatusCards events={events} loading={dataLoading} />
      <section className={lista.upcoming} aria-labelledby="eventos-proximos">
        <Heading id="eventos-proximos" level={2} variant="section" className={styles.sectionTitle}>
          Próximos eventos
        </Heading>
        {dataLoading ? (
          <SkeletonContent variant="list" label="Carregando eventos..." />
        ) : upcoming.length === 0 ? (
          <EmptyState variant="compact" title="Nenhum evento a caminho." description="Crie um evento para começar." />
        ) : (
          <div className={lista.list}>
            {upcoming.map((event) => (
              <EventListItem
                key={event.id}
                event={event}
                showIssues
                onView={setViewingEvent}
                onEdit={openEdit}
                onDelete={setDeleteTargetId}
                onFinalize={(id) => updateEvent(id, { status: 'completed' })}
              />
            ))}
          </div>
        )}
      </section>
      <EventosModals controller={controller} />
    </div>
  );
}
