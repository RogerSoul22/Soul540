import type { MenuRecord as Menu } from '../../../../../../packages/screens/src/index';
import styles from '../styles/Cardapios.module.scss';

type EventOption = { id: string; name: string };

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
          <h2 className={styles.sectionTitle}>Cardápios personalizados</h2>
          <p className={styles.sectionSubtitle}>Criados para eventos específicos.</p>
        </div>
        <input
          className={styles.searchInput}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar cardápio ou evento..."
        />
      </div>
      {!menus.length ? (
        <p className={styles.emptyState}>Nenhum cardápio personalizado encontrado.</p>
      ) : (
        <div className={styles.grid}>
          {menus.map((menu) => (
            <article key={menu.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardName}>{menu.name}</h3>
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
              <div className={styles.cardActions}>
                <button className={styles.btnView} onClick={() => onPreview(menu)}>
                  Visualizar
                </button>
                <button className={styles.btnEdit} onClick={() => onEdit(menu)}>
                  Editar
                </button>
                <button className={styles.btnDelete} onClick={() => onDelete(menu.id)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
