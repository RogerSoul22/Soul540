import { Button, Input } from '../../../../../../packages/pentagono/src/index';
import type { FranchiseFinanceController } from '../types/finance-controller-types';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceEventSelector({ controller }: { controller: FranchiseFinanceController }) {
  const {
    formEventId,
    setFormEventId,
    eventSearch,
    setEventSearch,
    showEventDropdown,
    setShowEventDropdown,
    dropdownPos,
    eventComboRef,
    openEventDropdown,
    eventDropdownOptions,
  } = controller;
  return (
    <div className={styles.eventCombo} ref={eventComboRef}>
      <Input
        type="text"
        className={`${styles.formSelect} ${styles.eventComboInput}`}
        placeholder="Buscar evento..."
        value={eventSearch}
        autoComplete="off"
        onChange={(event) => {
          setEventSearch(event.target.value);
          setFormEventId('');
          openEventDropdown();
        }}
        onFocus={openEventDropdown}
      />
      {(eventSearch || formEventId) && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className={styles.eventClearBtn}
          onClick={() => {
            setFormEventId('');
            setEventSearch('');
            setShowEventDropdown(false);
          }}
          title="Limpar"
        >
          ×
        </Button>
      )}
      {showEventDropdown && (
        <div
          className={styles.eventDropdown}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {eventDropdownOptions.length === 0 ? (
            <div className={styles.eventDropdownEmpty}>Nenhum evento encontrado</div>
          ) : (
            eventDropdownOptions.map((option) => (
              <Button
                variant="chip"
                key={option.id}
                type="button"
                className={`${styles.eventOption} ${formEventId === option.id ? styles.eventOptionSelected : ''}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  setFormEventId(option.id);
                  setEventSearch(option.name);
                  setShowEventDropdown(false);
                }}
              >
                {option.name}
              </Button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
