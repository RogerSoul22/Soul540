import type { PizzaEvent } from '@soul540/contracts';
import styles from '../styles/Eventos.module.scss';

export default function FactoryEventDetailsAdditional({ event }: { event: PizzaEvent }) {
  return (
    <>
      {event.menu && event.menu.length > 0 && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Cardápio</p>
          <div className={styles.menuTags}>
            {event.menu.map((item, i) => (
              <span key={i} className={styles.menuTag}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {event.notes && (
        <div className={styles.detailSection}>
          <p className={styles.detailSectionTitle}>Observações</p>
          <p className={styles.detailValue}>{event.notes}</p>
        </div>
      )}
    </>
  );
}
