import { IconAlertTriangle } from './CalendarEventIcons';
import type { PizzaEvent } from '../../../../../packages/contracts/src/index';
import styles from './styles/CalendarView.module.scss';

export function FactoryCalendarEventDelete({
  event,
  onCancel,
  onConfirm,
}: {
  event: PizzaEvent;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className={styles.panelBody}>
        <div className={styles.deleteConfirmBox}>
          <div className={styles.deleteWarningIcon}>
            <IconAlertTriangle />
          </div>
          <p className={styles.deleteConfirmTitle}>Excluir evento?</p>
          <p className={styles.deleteConfirmText}>
            Esta ação não pode ser desfeita. O evento <strong>"{event.name}"</strong> será removido permanentemente.
          </p>
        </div>
      </div>
      <div className={styles.panelActions}>
        <button className={styles.btnCancel} onClick={onCancel}>
          Cancelar
        </button>
        <button className={styles.btnDeleteConfirm} onClick={onConfirm}>
          Excluir
        </button>
      </div>
    </>
  );
}
