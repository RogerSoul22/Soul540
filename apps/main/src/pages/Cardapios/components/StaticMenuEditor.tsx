import { useState } from 'react';
import type { StaticMenu, StaticItem } from '../../../data/soul540Menus/index';
import styles from '../styles/Cardapios.module.scss';

export default function StaticMenuEditor({
  menu,
  onSave,
  onClose,
}: {
  menu: StaticMenu;
  onSave: (menu: StaticMenu) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<StaticMenu>(() => JSON.parse(JSON.stringify(menu)));
  const updateItem = (categoryIndex: number, itemIndex: number, field: keyof StaticItem, value: string) =>
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, currentCategory) =>
        currentCategory === categoryIndex
          ? {
              ...category,
              items: category.items.map((item, currentItem) =>
                currentItem === itemIndex ? { ...item, [field]: value } : item,
              ),
            }
          : category,
      ),
    }));
  const addItem = (categoryIndex: number) =>
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, index) =>
        index === categoryIndex ? { ...category, items: [...category.items, { name: '', description: '' }] } : category,
      ),
    }));
  const removeItem = (categoryIndex: number, itemIndex: number) =>
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, index) =>
        index === categoryIndex
          ? { ...category, items: category.items.filter((_, item) => item !== itemIndex) }
          : category,
      ),
    }));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.editStaticModal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar — {draft.name}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.editStaticBody}>
          {draft.categories.map((category, categoryIndex) => (
            <section key={category.name + categoryIndex} className={styles.editStaticCategory}>
              <h3>{category.name}</h3>
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.editStaticItem}>
                  <input
                    className={styles.formInput}
                    value={item.name}
                    onChange={(event) => updateItem(categoryIndex, itemIndex, 'name', event.target.value)}
                    placeholder="Nome"
                  />
                  <textarea
                    className={styles.formTextarea}
                    value={item.description}
                    onChange={(event) => updateItem(categoryIndex, itemIndex, 'description', event.target.value)}
                    placeholder="Descrição"
                  />
                  <button className={styles.btnDelete} onClick={() => removeItem(categoryIndex, itemIndex)}>
                    Remover
                  </button>
                </div>
              ))}
              <button className={styles.btnAddItem} onClick={() => addItem(categoryIndex)}>
                + Item
              </button>
            </section>
          ))}
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={() => onSave(draft)}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
