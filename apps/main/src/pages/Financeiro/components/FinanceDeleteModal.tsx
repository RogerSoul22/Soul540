import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceDeleteModal({ controller }: { controller: FinanceiroController }) {
  const { financePendingDelete, setFinancePendingDelete, deletingFinance, confirmFinanceDelete } = controller;
  if (!financePendingDelete) return null;
  return (
    <Modal
      title="Confirmar exclusão"
      size="sm"
      onClose={() => {
        if (!deletingFinance) setFinancePendingDelete(null);
      }}
    >
      <div className={styles.confirmDeleteContent}>
        <p>Tem certeza de que deseja excluir este lançamento? Esta ação não pode ser desfeita.</p>
        <div className={styles.confirmDeleteSummary}>
          <strong>{financePendingDelete.description || 'Sem descrição'}</strong>
          <span className={financePendingDelete.type === 'revenue' ? styles.green : styles.red}>
            {financePendingDelete.type === 'revenue' ? '+' : '-'} {formatBRL(financePendingDelete.amount)}
          </span>
        </div>
        <div className={styles.eventDetailActions}>
          <Button
            variant="secondary"
            type="button"
            disabled={deletingFinance}
            onClick={() => setFinancePendingDelete(null)}
          >
            Cancelar
          </Button>
          <Button variant="danger" type="button" disabled={deletingFinance} onClick={confirmFinanceDelete}>
            {deletingFinance ? 'Processando...' : 'Confirmar exclusão'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
