import { Button, DocumentViewer, Heading } from '../../../../../../packages/pentagono/src/index';
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
    <DocumentViewer
      variant="panel"
      label={menu.name}
      className={styles.menuOverlay}
      closeOnOverlay
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onGenerate} disabled={generating}>
            {generating ? 'Gerando...' : 'Baixar PDF'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </>
      }
    >
      <div className={styles.menuDocHeader}>
        <div className={styles.menuDocBrand}>
          Soul<span>540</span> Pizzas
        </div>
        <div className={styles.menuDocTagline}>· artesanal food ·</div>
        <Heading level={2} variant="section" className={styles.menuDocTitle}>
          {menu.name}
        </Heading>
        <p className={styles.menuDocSub}>{menu.tagline}</p>
      </div>
      <div className={styles.menuDocBody}>
        {menu.categories.map((category) => (
          <section key={category.name} className={styles.menuDocSection}>
            <Heading
              level={3}
              variant="section"
              className={
                styles.menuDocCatTitle +
                ' ' +
                (category.name.toLowerCase().includes('doce') ? styles.menuDocCatSweet : '')
              }
            >
              {category.name}
            </Heading>
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
    </DocumentViewer>
  );
}
