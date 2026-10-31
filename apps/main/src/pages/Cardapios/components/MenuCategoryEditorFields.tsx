import type { MenuCategory, MenuItem } from '@soul540/screens';
import styles from '../styles/Cardapios.module.scss';

type Props = {
  categories: MenuCategory[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onItemAdd: (id: string) => void;
  onItemRemove: (categoryId: string, itemId: string) => void;
  onItemChange: (categoryId: string, itemId: string, field: keyof MenuItem, value: string | number) => void;
};

export default function MenuCategoryEditorFields({
  categories,
  onAdd,
  onRemove,
  onChange,
  onItemAdd,
  onItemRemove,
  onItemChange,
}: Props) {
  return (
    <div className={styles.categoriesSection}>
      <div className={styles.categoriesHeader}>
        <strong>Categorias e itens</strong>
        <button className={styles.btnAddCat} type="button" onClick={onAdd}>
          + Categoria
        </button>
      </div>
      {categories.map((category) => (
        <section key={category.id} className={styles.categoryEditor}>
          <div className={styles.categoryEditorHeader}>
            <input
              className={styles.formInput}
              value={category.name}
              onChange={(event) => onChange(category.id, event.target.value)}
            />
            <button className={styles.btnRemoveCat} type="button" onClick={() => onRemove(category.id)}>
              Remover
            </button>
          </div>
          {category.items.map((item) => (
            <div key={item.id} className={styles.itemEditor}>
              <input
                className={styles.formInput}
                value={item.name}
                onChange={(event) => onItemChange(category.id, item.id, 'name', event.target.value)}
                placeholder="Nome do item"
              />
              <input
                className={styles.formInput}
                value={item.description}
                onChange={(event) => onItemChange(category.id, item.id, 'description', event.target.value)}
                placeholder="Descrição"
              />
              <input
                className={styles.formInput}
                type="number"
                value={item.price}
                onChange={(event) => onItemChange(category.id, item.id, 'price', Number(event.target.value))}
                placeholder="Preço"
              />
              <button className={styles.btnRemoveItem} type="button" onClick={() => onItemRemove(category.id, item.id)}>
                ×
              </button>
            </div>
          ))}
          <button className={styles.btnAddItem} type="button" onClick={() => onItemAdd(category.id)}>
            + Item
          </button>
        </section>
      ))}
    </div>
  );
}
