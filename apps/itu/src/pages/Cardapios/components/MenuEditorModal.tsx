import { Button, Input, Label, Modal, Select, Textarea } from '../../../../../../packages/pentagono/src/index';
import type { MenuCategory, MenuItem } from '../../../../../../packages/screens/src/index';
import styles from '../styles/Cardapios.module.scss';
import MenuCategoryEditor from './MenuCategoryEditor';

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
    <Modal title={editing ? 'Editar cardápio' : 'Novo cardápio'} onClose={onClose} closeOnOverlay maxWidth={680} flush>
      <div className={styles.form}>
        <Label className={styles.formLabel}>
          Nome
          <Input className={styles.formInput} value={name} onChange={(event) => onNameChange(event.target.value)} />
        </Label>
        <Label className={styles.formLabel}>
          Evento
          <Select className={styles.formSelect} value={eventId} onChange={(event) => onEventChange(event.target.value)}>
            <option value="">Sem evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
        </Label>
        <div className={styles.formRow}>
          <Label className={styles.formLabel}>
            Cabeçalho
            <Textarea
              className={styles.formTextarea}
              value={headerText}
              onChange={(event) => onHeaderChange(event.target.value)}
            />
          </Label>
          <Label className={styles.formLabel}>
            Rodapé
            <Textarea
              className={styles.formTextarea}
              value={footerText}
              onChange={(event) => onFooterChange(event.target.value)}
            />
          </Label>
        </div>
        <div className={styles.categoriesSection}>
          <div className={styles.categoriesHeader}>
            <strong>Categorias e itens</strong>
            <Button variant="dashed" className={styles.btnAddCat} type="button" onClick={onCategoryAdd}>
              + Categoria
            </Button>
          </div>
          {categories.map((category) => (
            <MenuCategoryEditor
              key={category.id}
              category={category}
              onCategoryChange={onCategoryChange}
              onCategoryRemove={onCategoryRemove}
              onItemAdd={onItemAdd}
              onItemRemove={onItemRemove}
              onItemChange={onItemChange}
            />
          ))}
        </div>
      </div>
      <div className={styles.formActions}>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={!name.trim()}>
          Salvar
        </Button>
      </div>
    </Modal>
  );
}
