import type { MenuRecord as Menu } from '../../../../../../packages/screens/src/index';
import styles from '../styles/Cardapios.module.scss';

export default function CustomMenuPreview({
  menu,
  eventName,
  onClose,
}: {
  menu: Menu;
  eventName?: string;
  onClose: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.preview} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Visualizar cardápio</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        {menu.headerText && <div className={styles.previewHeader}>{menu.headerText}</div>}
        <h3 className={styles.previewTitle}>{menu.name}</h3>
        {eventName && <p className={styles.previewEvent}>{eventName}</p>}
        {menu.categories.map((category) => (
          <section key={category.id} className={styles.previewCategory}>
            <h4>{category.name}</h4>
            {category.items.map((item) => (
              <div key={item.id} className={styles.previewItem}>
                <strong>{item.name}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price > 0 && <span>R$ {item.price.toFixed(2)}</span>}
              </div>
            ))}
          </section>
        ))}
        {menu.footerText && <div className={styles.previewFooter}>{menu.footerText}</div>}
      </div>
    </div>
  );
}
