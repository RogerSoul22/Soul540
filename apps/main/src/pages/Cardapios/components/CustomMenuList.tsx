import { Button, EmptyState, Heading, Input } from '../../../../../../packages/pentagono/src/index';
import type { MenuRecord as Menu } from '../../../../../../packages/screens/src/index';
import styles from '../styles/Cardapios.module.scss';

export default function CustomMenuList({
  menus,
  eventMap,
  search,
  onSearchChange,
  onPreview,
  onEdit,
  onDelete,
}: {
  menus: Menu[];
  eventMap: Record<string, string>;
  search: string;
  onSearchChange: (value: string) => void;
  onPreview: (menu: Menu) => void;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className={styles.customSection}>
      <div className={styles.sectionHeader}>
        <div>
          <Heading level={2} variant="section" className={styles.sectionTitle}>
            Cardápios personalizados
          </Heading>
          <p className={styles.sectionSubtitle}>Criados para eventos específicos.</p>
        </div>
        <Input
          variant="search"
          className={styles.searchInput}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar cardápio ou evento..."
        />
      </div>
      {!menus.length ? (
        <EmptyState variant="compact" title="Nenhum cardápio personalizado encontrado." className={styles.emptyState} />
      ) : (
        <div className={styles.grid}>
          {menus.map((menu) => (
            <article key={menu.id} className={styles.card}>
              <div className={styles.cardMeta}>
                <div className={styles.cardIdentity}>
                  <Heading level={3} variant="section" className={styles.cardName}>
                    {menu.name}
                  </Heading>
                  {menu.eventId && <p className={styles.cardEvent}>{eventMap[menu.eventId]}</p>}
                </div>
                <div className={styles.cardStats}>
                  <span className={styles.statBadge}>{menu.categories.length} categorias</span>
                  <span className={styles.statBadge}>
                    {menu.categories.reduce((sum, category) => sum + category.items.length, 0)} itens
                  </span>
                </div>
              </div>
              {menu.headerText && <p className={styles.cardSubText}>{menu.headerText}</p>}
              <div className={styles.categoriesList}>
                {menu.categories.map((category) => (
                  <div key={category.id} className={styles.categoryRow}>
                    <span>{category.name}</span>
                    <span className={styles.catCount}>{category.items.length} itens</span>
                  </div>
                ))}
              </div>
              <div className={styles.cardFooter}>
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
                  variant="danger"
                  size="sm"
                  className={styles.cardDangerButton}
                  onClick={() => onDelete(menu.id)}
                >
                  Excluir
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
