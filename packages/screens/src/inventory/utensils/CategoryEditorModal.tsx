import { Button, Input, Label } from '../../../../pentagono/src/index';
import type { RefObject } from 'react';
import InventoryModalFrame from './InventoryModalFrame';
import frameStyles from './styles/InventoryModalFrame.module.scss';
import styles from './styles/UtensilEditorModal.module.scss';

interface CategoryEditorModalProps {
  inputRef: RefObject<HTMLInputElement>;
  isOpen: boolean;
  newCategory: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CategoryEditorModal({
  inputRef,
  isOpen,
  newCategory,
  onChange,
  onClose,
  onSubmit,
}: CategoryEditorModalProps) {
  if (!isOpen) return null;

  return (
    <InventoryModalFrame
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={!newCategory.trim()}>
            Adicionar
          </Button>
        </>
      }
      maxWidth={400}
      onClose={onClose}
      title="Nova categoria"
    >
      <Label className={styles.group}>
        <span className={styles.label}>Nome da categoria</span>
        <Input
          ref={inputRef}
          className={styles.input}
          value={newCategory}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSubmit();
            if (event.key === 'Escape') onClose();
          }}
          placeholder="Ex: Fornos, Utensílios..."
        />
      </Label>
    </InventoryModalFrame>
  );
}
