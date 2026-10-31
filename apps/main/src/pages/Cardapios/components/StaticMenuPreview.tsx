import type { StaticMenu } from '../../../data/soul540Menus/index';
import styles from '../styles/Cardapios.module.scss';

export default function StaticMenuPreview({
  menu,
  generating,
  onGenerate,
  onClose,
}: {
  menu: StaticMenu;
  generating: boolean;
  onGenerate: () => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menuOverlay} onClick={(event) => event.stopPropagation()}>
        <div className={styles.menuTopActions}>
          <button className={styles.btnView} onClick={onGenerate} disabled={generating}>
            {generating ? 'Gerando...' : 'Baixar PDF'}
          </button>
          <button className={styles.menuClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.menuDocHeader}>
          <div className={styles.menuDocBrand}>
            Soul<span>540</span> Pizzas
          </div>
          <div className={styles.menuDocTagline}>· artesanal food ·</div>
          <h2 className={styles.menuDocTitle}>{menu.name}</h2>
          <p className={styles.menuDocSub}>{menu.tagline}</p>
        </div>
        <div className={styles.menuDocBody}>
          {menu.categories.map((category) => (
            <section key={category.name} className={styles.menuDocSection}>
              <h3
                className={
                  styles.menuDocCatTitle +
                  ' ' +
                  (category.name.toLowerCase().includes('doce') ? styles.menuDocCatSweet : '')
                }
              >
                {category.name}
              </h3>
              <div className={styles.menuDocItems}>
                {category.items.map((item) => (
                  <div key={item.name} className={styles.menuDocItem}>
                    <div className={styles.menuDocItemHeader}>
                      <span className={styles.menuDocItemName}>{item.name}</span>
                      {item.subtitle && <span className={styles.menuDocItemSub}>{item.subtitle}</span>}
                    </div>
                    {item.description && <p className={styles.menuDocItemDesc}>{item.description}</p>}
                    {item.harmonization && <p className={styles.menuDocItemHarm}>{item.harmonization}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
          {menu.obs && <p className={styles.menuDocObs}>{menu.obs}</p>}
        </div>
        <div className={styles.menuDocContact}>
          <span>@soul.pizzas</span>
          <span>19 98160-5481</span>
        </div>
      </div>
    </div>
  );
}
