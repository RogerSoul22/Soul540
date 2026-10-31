import type { SuppliesController } from '../hooks/use-supplies-controller';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyCategoryModal({ controller }: { controller: SuppliesController }) {
  const { showCategoryModal, setShowCategoryModal, newCategory, setNewCategory, addCategory } = controller;
  if (!showCategoryModal) return null;
  return (
    <div className={styles.overlay} onClick={() => setShowCategoryModal(false)}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nova categoria</h2>
          <button className={styles.modalClose} onClick={() => setShowCategoryModal(false)}>
            ×
          </button>
        </div>

        <div className={styles.form}>
          <label className={styles.label}>
            Nome
            <input
              autoFocus
              className={styles.input}
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            />
          </label>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnCancel} onClick={() => setShowCategoryModal(false)}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={addCategory} disabled={!newCategory.trim()}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
