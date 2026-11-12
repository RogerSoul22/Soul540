import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState, Heading, PageHeader, SkeletonContent } from '../../../../../packages/pentagono/src/index';
import { useApp } from '../../contexts/AppContext';
import { ROUTES } from '../../routes';
import EventCard from './components/EventCard';
import EventosFilters from './components/EventosFilters';
import EventosModals from './components/EventosModals';
import { useEventosController } from './hooks/use-eventos-controller';
import { formatBRL } from '../../../../../shared/common/currency';
import { eventValue, groupByMonth } from './support/event-listing';
import { findEventStatusPage } from './support/event-status';
import styles from './styles/Eventos.module.scss';

export default function EventosStatus() {
  const { status } = useParams();
  const page = findEventStatusPage(status);
  const navigate = useNavigate();
  const controller = useEventosController();
  const { dataLoading } = useApp();

  if (!page) return <Navigate to={ROUTES.EVENTOS} replace />;

  const events = controller.filtered[page.key];
  const groups = groupByMonth(events);
  const total = events.reduce((sum, event) => sum + eventValue(event), 0);

  return (
    <div className={styles.page} style={{ ['--status-accent' as string]: page.accent }}>
      <Button variant="link" className={styles.back} onClick={() => navigate(ROUTES.EVENTOS)}>
        ‹ Eventos
      </Button>
      <PageHeader
        title={page.label}
        subtitle={`${events.length} ${events.length === 1 ? 'evento' : 'eventos'} · ${formatBRL(total)}`}
        actions={<Button variant="primary" onClick={controller.openCreate}>+ Novo Evento</Button>}
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
        <div className={styles.statusPageGroups}>
          {groups.map((group) => {
            const groupTotal = group.events.reduce((sum, event) => sum + eventValue(event), 0);
            return (
              <section key={group.key} className={styles.statusPageGroup} aria-label={group.label}>
                <header className={styles.statusPageHeader}>
                  <Heading level={2} variant="section" className={styles.statusPageTitle}>
                    {group.label}
                  </Heading>
                  <span className={styles.statusPageMeta}>
                    {group.events.length} {group.events.length === 1 ? 'evento' : 'eventos'} · {formatBRL(groupTotal)}
                  </span>
                </header>
                <div className={styles.statusPageEvents}>
                  {group.events.map((event) => (
                    <EventCard
                      key={event.id}
                      ev={event}
                      employeeMap={controller.employeeMap}
                      onView={controller.setViewingEvent}
                      onEdit={controller.openEdit}
                      onDelete={controller.setDeleteTargetId}
                      onFinalize={(id) => controller.updateEvent(id, { status: 'completed' })}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <EventosModals controller={controller} />
    </div>
  );
}
