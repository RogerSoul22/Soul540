import { Modal } from '../../../../../../packages/ui/src/index';
import { Button } from '../../../../../../packages/ui/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceFormFields from './FinanceFormFields';
import FinanceRecurrenceFields from './FinanceRecurrenceFields';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceFormModal({ controller }: { controller: FinanceiroController }) {
  const { showForm, editingFinanceId, resetForm, setShowForm, handleSubmit, formRecurring } = controller;
  if (!showForm) return null;

  const close = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <Modal title={editingFinanceId ? 'Editar lançamento' : 'Novo lançamento financeiro'} size="lg" onClose={close}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <FinanceFormFields controller={controller} />
        {!editingFinanceId && <FinanceRecurrenceFields controller={controller} visible={formRecurring} />}
        <div className={styles.formActions}>
          <Button variant="secondary" type="button" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit">{editingFinanceId ? 'Salvar alterações' : 'Criar lançamento'}</Button>
        </div>
      </form>
    </Modal>
  );
}
