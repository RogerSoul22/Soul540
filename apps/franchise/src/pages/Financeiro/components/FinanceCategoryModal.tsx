import { DRE_SECTIONS } from '../../../../../../shared/finance/financeCategories';
import type { DreSection } from '../../../../../../shared/contracts/types';
import { Button } from '@soul540/ui';
import { Modal } from '@soul540/ui';
import styles from '../styles/Financeiro.module.scss';
import type { FinanceSupportController } from '../types/finance-support-types';

export default function FinanceCategoryModal({ controller }: { controller: FinanceSupportController }) {
  const {
    showCategoryModal,
    setShowCategoryModal,
    newCategoryLabel,
    setNewCategoryLabel,
    newCategorySection,
    setNewCategorySection,
    formType,
    handleCreateCategory,
    savingCategory,
  } = controller;

  return showCategoryModal ? (
    <Modal title="Nova Categoria" size="sm" onClose={() => setShowCategoryModal(false)}>
      <div className={styles.form}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Nome da categoria</label>
          <input
            type="text"
            className={styles.formInput}
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            placeholder="Ex: Manutenção de Fornos"
            autoFocus
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Seção do DRE</label>
          <select
            className={styles.formSelect}
            value={newCategorySection}
            onChange={(e) => setNewCategorySection(e.target.value as DreSection)}
          >
            {DRE_SECTIONS.filter((s) => s.type === formType).map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <p className={styles.formHint}>Define em qual linha do DRE essa categoria entra na exportação.</p>
        </div>
        <div className={styles.formActions}>
          <Button variant="secondary" type="button" onClick={() => setShowCategoryModal(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleCreateCategory} disabled={savingCategory || !newCategoryLabel.trim()}>
            {savingCategory ? 'Salvando...' : 'Criar categoria'}
          </Button>
        </div>
      </div>
    </Modal>
  ) : null;
}
