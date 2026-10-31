import EventCard from './EventCard';
import type { EventosController } from '../hooks/use-eventos-controller';
import { eventValue, groupByMonth } from '../support/event-listing';
import styles from '../styles/Eventos.module.scss';

const sectionDefinitions = [
  { key: 'orcamentos', label: 'Orçamentos', accent: '#3b82f6' },
  { key: 'confirmados', label: 'Eventos Fechados', accent: '#f59e0b' },
  { key: 'finalizados', label: 'Finalizados', accent: '#22c55e' },
  { key: 'cancelados', label: 'Cancelados', accent: '#6b7280' },
] as const;

export default function EventosSections({ controller }: { controller: EventosController }) {
  const {
    filtered,
    collapsedSections,
    expandedMonths,
    toggleSection,
    toggleMonth,
    employeeMap,
    openEdit,
    setViewingEvent,
    updateEvent,
    setDeleteTargetId,
    openCreate,
  } = controller;
  const hasEvents = Object.values(filtered).some((events) => events.length > 0);
  if (!hasEvents)
    return (
      <div className={styles.empty}>
        <p>Nenhum evento encontrado.</p>
        <button className={styles.emptyBtn} onClick={openCreate}>
          Criar primeiro agendamento
        </button>
      </div>
    );
  return (
    <div className={styles.sections}>
      {sectionDefinitions.map(({ key, label, accent }) => {
        const events = filtered[key];
        const isCollapsed = collapsedSections.has(key);
        const total = events.reduce((sum, event) => sum + eventValue(event), 0);
        return (
          <div key={key} className={styles.section}>
            <button className={styles.sectionHeader} onClick={() => toggleSection(key)}>
              <div className={styles.sectionHeaderLeft}>
                <h2 className={styles.sectionTitle} style={{ color: accent }}>
                  {label}
                </h2>
                <span className={styles.sectionCount}>
                  {events.length} evento{events.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className={styles.sectionHeaderRight}>
                {events.length > 0 && (
                  <span className={styles.sectionTotal} style={{ color: accent }}>
                    R$ {total.toLocaleString('pt-BR')}
                  </span>
                )}
                <svg
                  className={`${styles.sectionChevron} ${isCollapsed ? styles.sectionChevronCollapsed : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
            {!isCollapsed &&
              (events.length === 0 ? (
                <p className={styles.sectionEmpty}>Nenhum evento.</p>
              ) : (
                groupByMonth(events).map((group) => {
                  const isOpen = expandedMonths.has(group.key);
                  const monthTotal = group.events.reduce((sum, event) => sum + eventValue(event), 0);
                  return (
                    <div key={group.key} className={styles.monthGroup}>
                      <button
                        className={`${styles.monthCard} ${isOpen ? styles.monthCardOpen : ''}`}
                        onClick={() => toggleMonth(group.key)}
                      >
                        <div className={styles.monthCardLeft}>
                          <span className={styles.monthCardName}>{group.label}</span>
                          <span className={styles.monthCardCount}>
                            {group.events.length} evento{group.events.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className={styles.monthCardRight}>
                          <span className={styles.monthCardValue}>R$ {monthTotal.toLocaleString('pt-BR')}</span>
                          <span className={`${styles.monthCardChevron} ${isOpen ? styles.monthCardChevronOpen : ''}`}>
                            ⌄
                          </span>
                        </div>
                      </button>
                      {isOpen && (
                        <div className={styles.monthCardBody}>
                          {group.events.map((event) => (
                            <EventCard
                              key={event.id}
                              ev={event}
                              employeeMap={employeeMap}
                              onView={setViewingEvent}
                              onEdit={openEdit}
                              onDelete={setDeleteTargetId}
                              onFinalize={(id) => updateEvent(id, { status: 'completed' })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
          </div>
        );
      })}
    </div>
  );
}
