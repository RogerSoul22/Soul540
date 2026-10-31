import styles from '../styles/ChecklistEnvioPage.module.scss';
import type { ChecklistItem } from '../types';

type Props = {
  items: ChecklistItem[];
  checked: Record<string, boolean>;
  completed: number;
  totalItems: number;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onRequestRemove: (id: string) => void;
};

export function ChecklistItems({ items, checked, completed, totalItems, onToggle, onUpdate, onRequestRemove }: Props) {
  return (
    <article className={styles.panel}>
      <div className={styles.groupHeader}>
        <h2 className={styles.groupTitle}>Itens para envio</h2>
        <span className={styles.groupCount}>{completed}/{totalItems}</span>
      </div>
      <div className={styles.items}>
        {items.length === 0 ? <div className={styles.empty}>Nenhum item escrito ainda.</div> : items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <div className={`${styles.itemEditable} ${isChecked ? styles.itemChecked : ''}`} key={item.id}>
              <button className={styles.checkboxButton} type="button" onClick={() => onToggle(item.id)}>
                <span className={styles.checkbox}>{isChecked ? '✓' : ''}</span>
              </button>
              <input className={styles.itemInput} value={item.text} onChange={(event) => onUpdate(item.id, event.target.value)} />
              <button className={styles.removeButton} type="button" onClick={() => onRequestRemove(item.id)} aria-label="Remover item">x</button>
            </div>
          );
        })}
      </div>
    </article>
  );
}
