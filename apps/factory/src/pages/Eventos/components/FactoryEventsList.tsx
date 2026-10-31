import type { FactoryEventController } from '../hooks/use-factory-event-controller';
import FactoryEventCard from './FactoryEventCard';
import styles from '../styles/Eventos.module.scss';

export default function FactoryEventsList({ controller }: { controller: FactoryEventController }) {
  const {
    search,
    setSearch,
    showInfo,
    setShowInfo,
    filtered,
    monthGroupsFechados,
    expandedMonths,
    toggleMonth,
    employeeMap,
    setViewingEvent,
  } = controller;
  return (
    <>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Eventos</h1>
            <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title="Como usar esta página">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
          <p className={styles.subtitle}>Visualize os agendamentos e eventos de pizza</p>
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Buscar eventos..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>
      {filtered.fechados.length === 0 && filtered.orcamentos.length === 0 ? (
        <div className={styles.empty}>
          <p>Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className={styles.sections}>
          {filtered.orcamentos.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Orçamentos</h2>
              <div className={styles.grid}>
                {filtered.orcamentos.map((event) => (
                  <FactoryEventCard key={event.id} ev={event} employeeMap={employeeMap} onView={setViewingEvent} />
                ))}
              </div>
            </div>
          )}
          {monthGroupsFechados.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Eventos Fechados</h2>
              <div className={styles.monthGroup}>
                {monthGroupsFechados.map(({ key, label, events }) => {
                  const isOpen = expandedMonths.has(key);
                  const total = events.reduce((sum, event) => sum + (event.finalValue ?? event.budget ?? 0), 0);
                  return (
                    <div key={key}>
                      <button
                        className={`${styles.monthCard} ${isOpen ? styles.monthCardOpen : ''}`}
                        onClick={() => toggleMonth(key)}
                      >
                        <div className={styles.monthCardLeft}>
                          <span className={styles.monthCardName}>{label}</span>
                          <span className={styles.monthCardCount}>
                            {events.length} evento{events.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className={styles.monthCardRight}>
                          {total > 0 && (
                            <span className={styles.monthCardValue}>R$ {total.toLocaleString('pt-BR')}</span>
                          )}
                          <svg
                            className={`${styles.monthCardChevron} ${isOpen ? styles.monthCardChevronOpen : ''}`}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </button>
                      {isOpen && (
                        <div className={styles.monthCardBody}>
                          <div className={styles.grid}>
                            {events.map((event) => (
                              <FactoryEventCard
                                key={event.id}
                                ev={event}
                                employeeMap={employeeMap}
                                onView={setViewingEvent}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
