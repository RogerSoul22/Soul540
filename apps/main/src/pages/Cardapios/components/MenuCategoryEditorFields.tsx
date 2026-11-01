import { Button, Input } from '../../../../../../packages/pentagono/src/index';
import type { MenuCategory, MenuItem } from '../../../../../../packages/screens/src/index';
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
        <Button variant="dashed" className={styles.btnAddCat} type="button" onClick={onAdd}>
          + Categoria
        </Button>
      </div>
      {categories.map((category) => (
        <section key={category.id} className={styles.categoryEditor}>
          <div className={styles.categoryEditorHeader}>
            <Input
              className={styles.formInput}
              value={category.name}
              onChange={(event) => onChange(category.id, event.target.value)}
            />
            <Button
              variant="danger"
              size="sm"
              className={styles.btnRemoveCat}
              type="button"
              onClick={() => onRemove(category.id)}
            >
              Remover
            </Button>
          </div>
          {category.items.map((item) => (
            <div key={item.id} className={styles.itemEditor}>
              <Input
                className={styles.formInput}
                value={item.name}
                onChange={(event) => onItemChange(category.id, item.id, 'name', event.target.value)}
                placeholder="Nome do item"
              />
              <Input
                className={styles.formInput}
                value={item.description}
                onChange={(event) => onItemChange(category.id, item.id, 'description', event.target.value)}
                placeholder="Descrição"
              />
              <Input
                className={styles.formInput}
                type="number"
                value={item.price}
                onChange={(event) => onItemChange(category.id, item.id, 'price', Number(event.target.value))}
                placeholder="Preço"
              />
              <Button
                variant="danger"
                size="sm"
                className={styles.btnRemoveItem}
                type="button"
                onClick={() => onItemRemove(category.id, item.id)}
              >
                ×
              </Button>
            </div>
          ))}
          <Button variant="dashed" className={styles.btnAddItem} type="button" onClick={() => onItemAdd(category.id)}>
            + Item
          </Button>
        </section>
      ))}
    </div>
  );
}
