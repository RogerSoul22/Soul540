import type { MenuCategory, MenuItem } from '@soul540/screens';
import styles from '../styles/Cardapios.module.scss';
import MenuCategoryEditorFields from './MenuCategoryEditorFields';

type EventOption = { id: string; name: string };
type Props = {
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
};

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
}: Props) {
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
          <MenuCategoryEditorFields
            categories={categories}
            onAdd={onCategoryAdd}
            onRemove={onCategoryRemove}
            onChange={onCategoryChange}
            onItemAdd={onItemAdd}
            onItemRemove={onItemRemove}
            onItemChange={onItemChange}
          />
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
