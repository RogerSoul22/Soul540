import { Modal } from '../../../../../../packages/ui/src/index';
import { Button } from '../../../../../../packages/ui/src/index';
import styles from '../styles/Financeiro.module.scss';
import FinanceFormFields from './FinanceFormFields';
import FinanceRecurrenceFields from './FinanceRecurrenceFields';
import type { FranchiseFinanceController } from '../types/finance-controller-types';

export default function FinanceFormModal({ controller }: { controller: FranchiseFinanceController }) {
  const { showForm, editingFinanceId, resetForm, setShowForm, handleSubmit } = controller;
  if (!showForm) return null;
  const close = () => {
    resetForm();
    setShowForm(false);
  };
  return (
    <Modal
      title={editingFinanceId ? 'Editar lançamento financeiro' : 'Novo lançamento financeiro'}
      size="lg"
      onClose={close}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <FinanceFormFields controller={controller} />
        {!editingFinanceId && <FinanceRecurrenceFields controller={controller} />}
        <div className={styles.formActions}>
          <Button variant="secondary" type="button" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit">{editingFinanceId ? 'Salvar alterações' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
