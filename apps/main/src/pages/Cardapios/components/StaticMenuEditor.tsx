import { Button, Heading, Input, Modal, Textarea } from '../../../../../../packages/pentagono/src/index';
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
    <Modal title={`Editar — ${draft.name}`} onClose={onClose} closeOnOverlay className={styles.editStaticModal} flush>
      <div className={styles.editStaticBody}>
        {draft.categories.map((category, categoryIndex) => (
          <section key={category.name + categoryIndex} className={styles.editStaticCategory}>
            <Heading level={3} variant="section">
              {category.name}
            </Heading>
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className={styles.editStaticItem}>
                <Input
                  className={styles.formInput}
                  value={item.name}
                  onChange={(event) => updateItem(categoryIndex, itemIndex, 'name', event.target.value)}
                  placeholder="Nome"
                />
                <Textarea
                  className={styles.formTextarea}
                  value={item.description}
                  onChange={(event) => updateItem(categoryIndex, itemIndex, 'description', event.target.value)}
                  placeholder="Descrição"
                />
                <Button variant="danger" onClick={() => removeItem(categoryIndex, itemIndex)}>
                  Remover
                </Button>
              </div>
            ))}
            <Button variant="dashed" className={styles.btnAddItem} onClick={() => addItem(categoryIndex)}>
              + Item
            </Button>
          </section>
        ))}
      </div>
      <div className={styles.formActions}>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => onSave(draft)}>
          Salvar
        </Button>
      </div>
    </Modal>
  );
}
