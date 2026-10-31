import type { MenuCategory, MenuItem } from '../../../../../../packages/screens/src/index';
import styles from '../styles/Cardapios.module.scss';

type EventOption = { id: string; name: string };

export default function MenuEditorModal({
  editing,
  name,
  eventId,
  headerText,
  footerText,
  categories,
  events,
  onNameChange,
  onEventChange,
  onHeaderChange,
  onFooterChange,
  onCategoryAdd,
  onCategoryRemove,
  onCategoryChange,
  onItemAdd,
  onItemRemove,
  onItemChange,
  onClose,
  onSubmit,
}: {
  editing: boolean;
  name: string;
  eventId: string;
  headerText: string;
  footerText: string;
  categories: MenuCategory[];
  events: EventOption[];
  onNameChange: (value: string) => void;
  onEventChange: (value: string) => void;
  onHeaderChange: (value: string) => void;
  onFooterChange: (value: string) => void;
  onCategoryAdd: () => void;
  onCategoryRemove: (id: string) => void;
  onCategoryChange: (id: string, value: string) => void;
  onItemAdd: (id: string) => void;
  onItemRemove: (categoryId: string, itemId: string) => void;
  onItemChange: (categoryId: string, itemId: string, field: keyof MenuItem, value: string | number) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editing ? 'Editar cardápio' : 'Novo cardápio'}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.form}>
          <label className={styles.formLabel}>
            Nome
            <input className={styles.formInput} value={name} onChange={(event) => onNameChange(event.target.value)} />
          </label>
          <label className={styles.formLabel}>
            Evento
            <select
              className={styles.formSelect}
              value={eventId}
              onChange={(event) => onEventChange(event.target.value)}
            >
              <option value="">Sem evento</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              Cabeçalho
              <textarea
                className={styles.formTextarea}
                value={headerText}
                onChange={(event) => onHeaderChange(event.target.value)}
              />
            </label>
            <label className={styles.formLabel}>
              Rodapé
              <textarea
                className={styles.formTextarea}
                value={footerText}
                onChange={(event) => onFooterChange(event.target.value)}
              />
            </label>
          </div>
          <div className={styles.categoriesSection}>
            <div className={styles.categoriesHeader}>
              <strong>Categorias e itens</strong>
              <button className={styles.btnAddCat} type="button" onClick={onCategoryAdd}>
                + Categoria
              </button>
            </div>
            {categories.map((category) => (
              <section key={category.id} className={styles.categoryEditor}>
                <div className={styles.categoryEditorHeader}>
                  <input
                    className={styles.formInput}
                    value={category.name}
                    onChange={(event) => onCategoryChange(category.id, event.target.value)}
                  />
                  <button className={styles.btnRemoveCat} type="button" onClick={() => onCategoryRemove(category.id)}>
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
                    <button
                      className={styles.btnRemoveItem}
                      type="button"
                      onClick={() => onItemRemove(category.id, item.id)}
                    >
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
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={onSubmit} disabled={!name.trim()}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
