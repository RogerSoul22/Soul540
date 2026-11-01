import { Button } from '../../../../pentagono/src/index';
import type { Contractor } from './contractor-types';
import styles from './styles/ContractorDirectoryScreen.module.scss';

interface ContractorCategorySectionProps {
  categories: string[];
  contractors: Contractor[];
  onDelete: (category: string) => void;
  onOpenEditor: () => void;
  onSelect: (category: string | null) => void;
  selectedCategory: string | null;
}

export default function ContractorCategorySection({
  categories,
  contractors,
  onDelete,
  onOpenEditor,
  onSelect,
  selectedCategory,
}: ContractorCategorySectionProps) {
  return (
    <section className={styles.categories}>
      <p className={styles.sectionLabel}>Categorias</p>
      <div className={styles.categoryGrid}>
        {categories.map((category) => {
          const selected = selectedCategory === category;
          const count = contractors.filter((contractor) => contractor.category === category).length;
          return (
            <Button
              variant="chip"
              className={`${styles.categoryCard} ${selected ? styles.categoryCardActive : ''}`}
              key={category}
              onClick={() => onSelect(selected ? null : category)}
            >
              <span>{category}</span>
              <small>
                {count} contratante{count === 1 ? '' : 's'}
              </small>
              <span
                aria-label={`Remover ${category}`}
                className={styles.deleteCategory}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(category);
                }}
                role="button"
              >
                ×
              </span>
            </Button>
          );
        })}
        <Button variant="dashed" className={styles.addCategory} onClick={onOpenEditor}>
          + Nova categoria
        </Button>
      </div>
    </section>
  );
}
