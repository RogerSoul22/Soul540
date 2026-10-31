import { Modal } from '@soul540/ui';
import { Button } from '@soul540/ui';
import styles from '../styles/Financeiro.module.scss';
import FinanceFormFields from './FinanceFormFields';
import FinanceRecurrenceFields from './FinanceRecurrenceFields';
import type { FactoryFinanceController } from '../types/finance-controller-types';

export default function FinanceFormModal({ controller }: { controller: FactoryFinanceController }) {
  const { showForm, editingId, resetForm, setShowForm, handleSubmit } = controller;
  if (!showForm) return null;
  const close = () => {
    resetForm();
    setShowForm(false);
  };
  return (
    <Modal title={editingId ? 'Editar lançamento financeiro' : 'Novo lançamento financeiro'} size="lg" onClose={close}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <FinanceFormFields controller={controller} />
        {!editingId && <FinanceRecurrenceFields controller={controller} />}
        <div className={styles.formActions}>
          <Button variant="secondary" type="button" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit">{editingId ? 'Salvar alterações' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
