import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceEventField({ controller }: { controller: FinanceiroController }) {
  const {
    formEventId,
    setFormEventId,
    eventSearch,
    setEventSearch,
    showEventDropdown,
    setShowEventDropdown,
    eventComboRef,
    eventDropdownOptions,
  } = controller;

  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>Evento</label>
      <div className={styles.eventCombo} ref={eventComboRef}>
        <input
          type="text"
          className={styles.formInput + ' ' + styles.eventComboInput}
          placeholder="Buscar evento..."
          value={eventSearch}
          autoComplete="off"
          onChange={(event) => {
            setEventSearch(event.target.value);
            setFormEventId('');
            setShowEventDropdown(true);
          }}
          onFocus={() => setShowEventDropdown(true)}
        />
        {(eventSearch || formEventId) && (
          <button
            type="button"
            className={styles.eventClearBtn}
            onClick={() => {
              setFormEventId('');
              setEventSearch('');
              setShowEventDropdown(false);
            }}
            title="Limpar evento"
          >
            ×
          </button>
        )}
        {showEventDropdown && (
          <div className={styles.eventDropdown}>
            {eventDropdownOptions.length === 0 ? (
              <div className={styles.eventDropdownEmpty}>Nenhum evento encontrado</div>
            ) : (
              eventDropdownOptions.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={styles.eventOption + ' ' + (formEventId === event.id ? styles.eventOptionSelected : '')}
                  onMouseDown={(mouseEvent) => {
                    mouseEvent.preventDefault();
                    setFormEventId(event.id);
                    setEventSearch(event.name);
                    setShowEventDropdown(false);
                  }}
                >
                  {event.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
