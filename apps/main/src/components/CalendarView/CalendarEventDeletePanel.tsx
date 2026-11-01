import { Button } from '../../../../../packages/pentagono/src/index';
import type { PizzaEvent } from '../../../../../packages/contracts/src/index';
import styles from './styles/CalendarView.module.scss';

type Props = { event: PizzaEvent; onCancel: () => void; onConfirm: () => void };

export default function CalendarEventDeletePanel({ event, onCancel, onConfirm }: Props) {
  return (
    <>
      <div className={styles.panelBody}>
        <div className={styles.deleteConfirmBox}>
          <div className={styles.deleteWarningIcon}>⚠</div>
          <p className={styles.deleteConfirmTitle}>Excluir evento?</p>
          <p className={styles.deleteConfirmText}>
            Esta ação não pode ser desfeita. O evento <strong>"{event.name}"</strong> será removido permanentemente.
          </p>
        </div>
      </div>
      <div className={styles.panelActions}>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Excluir
        </Button>
      </div>
    </>
  );
}
