import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState, Heading, PageHeader, SkeletonContent } from '../../../../../packages/pentagono/src/index';
import { useApp } from '../../contexts/AppContext';
import { ROUTES } from '../../routes';
import EventListItem from './components/EventListItem';
import EventosFilters from './components/EventosFilters';
import EventosModals from './components/EventosModals';
import { useEventosController } from './hooks/use-eventos-controller';
import lista from './styles/EventosLista.module.scss';
import styles from './styles/EventosOverview.module.scss';
import { eventValue } from './support/event-listing';
import { formatBRL, groupEventsByPeriod } from './support/event-periods';
import { findEventStatusPage } from './support/event-status';

export default function EventosStatus() {
  const { status } = useParams();
  const page = findEventStatusPage(status);
  const navigate = useNavigate();
  const controller = useEventosController();
  const { dataLoading } = useApp();
  const { filtered, openCreate, openEdit, setViewingEvent, setDeleteTargetId, updateEvent } = controller;

  if (!page) return <Navigate to={ROUTES.EVENTOS} replace />;

  const events = filtered[page.key];
  const total = events.reduce((sum, event) => sum + eventValue(event), 0);
  const groups = groupEventsByPeriod(events, page.upcoming);

  return (
    <div className={styles.page} style={{ ['--status-accent' as string]: page.accent }}>
      <Button variant="link" className={styles.back} onClick={() => navigate(ROUTES.EVENTOS)}>
        ‹ Eventos
      </Button>
      <PageHeader
        title={page.label}
        subtitle={`${events.length} ${events.length === 1 ? 'evento' : 'eventos'} · ${formatBRL(total)}`}
        actions={
          <Button variant="primary" onClick={openCreate}>
            + Novo Evento
          </Button>
        }
      />
      <EventosFilters controller={controller} />
      {dataLoading ? (
        <SkeletonContent variant="list" label="Carregando eventos..." />
      ) : groups.length === 0 ? (
        <EmptyState
          title={`Nenhum ${page.singular} encontrado.`}
          description="Ajuste a busca ou os filtros para ver outros eventos."
        />
      ) : (
        groups.map((group) => (
          <section key={group.key} className={lista.group} aria-label={group.label}>
            <div className={lista.groupHeader}>
              <Heading level={2} variant="section" className={lista.groupTitle}>
                {group.label}
              </Heading>
              <span className={lista.groupMeta}>
                {group.events.length} {group.events.length === 1 ? 'evento' : 'eventos'} · {formatBRL(group.total)}
              </span>
            </div>
            <div className={lista.list}>
              {group.events.map((event) => (
                <EventListItem
                  key={event.id}
                  event={event}
                  showIssues={page.upcoming}
                  onView={setViewingEvent}
                  onEdit={openEdit}
                  onDelete={setDeleteTargetId}
                  onFinalize={(id) => updateEvent(id, { status: 'completed' })}
                />
              ))}
            </div>
          </section>
        ))
      )}
      <EventosModals controller={controller} />
    </div>
  );
}
