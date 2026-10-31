import type { Utensil } from './utensil-types';
import styles from './styles/UtensilsInventoryCategories.module.scss';

interface UtensilsInventoryCategoriesProps {
  categories: string[];
  onAddCategory: () => void;
  onDeleteCategory: (category: string) => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
  utensils: Utensil[];
}

export default function UtensilsInventoryCategories({
  categories,
  onAddCategory,
  onDeleteCategory,
  onSelectCategory,
  selectedCategory,
  utensils,
}: UtensilsInventoryCategoriesProps) {
  return (
    <section className={styles.section}>
      <p className={styles.title}>Categorias</p>
      <div className={styles.grid}>
        {categories.map((category) => {
          const count = utensils.filter((utensil) => utensil.category === category).length;
          const isActive = selectedCategory === category;

          return (
            <div
              key={category}
              className={`${styles.categoryCard} ${isActive ? styles.active : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              <div className={styles.categoryTop}>
                <span className={styles.categoryName}>{category}</span>
                <button
                  className={styles.deleteButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteCategory(category);
                  }}
                  title="Remover"
                >
                  <CloseIcon />
                </button>
              </div>
              <span className={styles.categoryCount}>
                {count} item{count !== 1 ? 's' : ''}
              </span>
            </div>
          );
        })}
        <button className={styles.addButton} onClick={onAddCategory}>
          <PlusIcon />
          <span>Nova categoria</span>
        </button>
      </div>
    </section>
  );
}

function CloseIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
