import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Financeiro.module.scss';
import FinanceFormFields from './FinanceFormFields';
import FinanceRecurrenceFields from './FinanceRecurrenceFields';
import type { FactoryFinanceController } from '../types/finance-controller-types';

export default function FinanceFormModal({ controller }: { controller: FactoryFinanceController }) {
  const { showForm, editingId, savingFinance, resetForm, setShowForm, handleSubmit } = controller;
  if (!showForm) return null;
  const close = () => {
    if (savingFinance) return;
    resetForm();
    setShowForm(false);
  };
  return (
    <Modal title={editingId ? 'Editar lançamento financeiro' : 'Novo lançamento financeiro'} size="lg" onClose={close}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <FinanceFormFields controller={controller} />
        {!editingId && <FinanceRecurrenceFields controller={controller} />}
        <div className={styles.formActions}>
          <Button variant="secondary" type="button" onClick={close} disabled={savingFinance}>
            Cancelar
          </Button>
          <Button type="submit" loading={savingFinance} aria-label={savingFinance ? 'Salvando lançamento' : undefined}>
            {editingId ? 'Salvar alterações' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
