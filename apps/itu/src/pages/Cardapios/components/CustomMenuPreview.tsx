import { Button, Heading, Modal } from '../../../../../../packages/pentagono/src/index';
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
    <Modal title="Visualizar cardápio" onClose={onClose} closeOnOverlay maxWidth={500} className={styles.preview} flush>
      {menu.headerText && <div className={styles.previewHeader}>{menu.headerText}</div>}
      <Heading level={3} variant="section" className={styles.previewTitle}>
        {menu.name}
      </Heading>
      {eventName && <p className={styles.previewEvent}>{eventName}</p>}
      {menu.categories.map((category) => (
        <section key={category.id} className={styles.previewCategory}>
          <Heading level={4} variant="section">
            {category.name}
          </Heading>
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
    </Modal>
  );
}
