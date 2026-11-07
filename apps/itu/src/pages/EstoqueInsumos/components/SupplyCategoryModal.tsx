import { Button, Input, Label, Modal } from '../../../../../../packages/pentagono/src/index';
import type { SuppliesController } from '../hooks/use-supplies-controller';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyCategoryModal({ controller }: { controller: SuppliesController }) {
  const { showCategoryModal, setShowCategoryModal, newCategory, setNewCategory, addCategory } = controller;
  if (!showCategoryModal) return null;
  return (
    <Modal title="Nova categoria" onClose={() => setShowCategoryModal(false)} closeOnOverlay maxWidth={520} flush>
      <div className={styles.form}>
        <Label className={styles.label}>
          Nome
          <Input
            autoFocus
            className={styles.input}
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
          />
        </Label>
      </div>
      <div className={styles.formActions}>
        <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={addCategory} disabled={!newCategory.trim()}>
          Adicionar
        </Button>
      </div>
    </Modal>
  );
}
