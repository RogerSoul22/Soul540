import { Button, Heading } from '../../../../../../packages/pentagono/src/index';
import type { StaticMenu } from '../../../data/soul540Menus/index';
import styles from '../styles/Cardapios.module.scss';

const colors: Record<string, string> = {
  eccezionale: styles.menuAmber,
  superiore: styles.menuRed,
  raffinato: styles.menuGold,
};

export default function StaticMenuGrid({
  menus,
  overrides,
  generatingPdf,
  onPreview,
  onEdit,
  onGeneratePdf,
}: {
  menus: StaticMenu[];
  overrides: Record<string, StaticMenu>;
  generatingPdf: string | null;
  onPreview: (menu: StaticMenu) => void;
  onEdit: (menu: StaticMenu) => void;
  onGeneratePdf: (menu: StaticMenu) => void;
}) {
  return (
    <section className={styles.standardSection}>
      <div className={styles.sectionHeader}>
        <div>
          <Heading level={2} variant="section" className={styles.sectionTitle}>
            Menus Soul540
          </Heading>
          <p className={styles.sectionSubtitle}>Opções padrão para apresentação aos clientes.</p>
        </div>
      </div>
      <div className={styles.standardGrid}>
        {menus.map((source) => {
          const menu = overrides[source.id] || source;
          const itemCount = menu.categories.reduce((sum, category) => sum + category.items.length, 0);
          return (
            <article key={menu.id} className={styles.standardCard + ' ' + (colors[menu.id] || '')}>
              <div className={styles.standardCardMeta}>
                <span className={styles.standardBadge}>Soul540</span>
                <span className={styles.standardTotal}>{itemCount} itens</span>
              </div>
              <Heading level={3} variant="section" className={styles.standardName}>
                {menu.name}
              </Heading>
              <p className={styles.standardTagline}>{menu.tagline}</p>
              <div className={styles.standardCategoryList}>
                {menu.categories.map((category) => (
                  <div key={category.name} className={styles.standardCategoryItem}>
                    <span className={styles.standardCategoryName}>{category.name}</span>
                    <strong className={styles.standardCategoryCount}>{category.items.length}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.standardCardFooter}>
                <Button
                  variant="primary"
                  size="sm"
                  className={styles.cardPrimaryButton}
                  onClick={() => onPreview(menu)}
                >
                  Visualizar
                </Button>
                <Button variant="outline" className={styles.cardSecondaryButton} onClick={() => onEdit(menu)}>
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className={styles.cardPdfButton}
                  onClick={() => onGeneratePdf(menu)}
                  disabled={generatingPdf === menu.id}
                >
                  {generatingPdf === menu.id ? 'Gerando...' : 'PDF'}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
