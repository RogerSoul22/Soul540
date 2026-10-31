import { Button } from '@soul540/ui';
import { Modal } from '@soul540/ui';
import { DRE_SECTIONS } from '../../../../../../shared/finance/financeCategories';
import type { DreSection } from '@soul540/contracts';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceCategoryModal({ controller }: { controller: FinanceiroController }) {
  const {
    showCategoryModal,
    setShowCategoryModal,
    newCategoryLabel,
    setNewCategoryLabel,
    newCategorySection,
    setNewCategorySection,
    formType,
    savingCategory,
    handleCreateCategory,
  } = controller;
  if (!showCategoryModal) return null;
  return (
    <Modal title="Nova Categoria" size="sm" onClose={() => setShowCategoryModal(false)}>
      <div className={styles.form}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Nome da categoria</label>
          <input
            type="text"
            className={styles.formInput}
            value={newCategoryLabel}
            onChange={(event) => setNewCategoryLabel(event.target.value)}
            placeholder="Ex: Manutenção de Fornos"
            autoFocus
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Seção do DRE</label>
          <select
            className={styles.formSelect}
            value={newCategorySection}
            onChange={(event) => setNewCategorySection(event.target.value as DreSection)}
          >
            {DRE_SECTIONS.filter((section) => section.type === formType).map((section) => (
              <option key={section.key} value={section.key}>
                {section.label}
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
  );
}
