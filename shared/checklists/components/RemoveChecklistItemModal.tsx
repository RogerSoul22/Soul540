import styles from '../styles/ChecklistEnvioPage.module.scss';
import type { ChecklistItem } from '../types';

type Props = {
  item?: ChecklistItem;
  onCancel: () => void;
  onConfirm: (id: string) => void;
};

export function RemoveChecklistItemModal({ item, onCancel, onConfirm }: Props) {
  if (!item) return null;
  return (
    <div className={styles.modalOverlay} role="presentation" onMouseDown={onCancel}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="remove-title" onMouseDown={(event) => event.stopPropagation()}>
        <h2 className={styles.modalTitle} id="remove-title">Remover item?</h2>
        <p className={styles.modalText}>{item.text}</p>
        <div className={styles.modalActions}>
          <button className={styles.buttonGhost} type="button" onClick={onCancel}>Cancelar</button>
          <button className={styles.buttonDanger} type="button" onClick={() => onConfirm(item.id)}>Remover</button>
        </div>
      </div>
    </div>
  );
}
