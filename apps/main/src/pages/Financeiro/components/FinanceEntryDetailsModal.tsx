import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import { getDerivedFinanceLabel } from '../../../../../../shared/finance/financePolicy';
import { Modal } from '@soul540/ui';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

function safeDate(value: string | undefined | null) {
  if (!value) return '-';
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy', { locale: ptBR }) : '-';
}

export default function FinanceEntryDetailsModal({ controller }: { controller: FinanceiroController }) {
  const {
    selectedFinance,
    setSelectedFinance,
    activeEvents,
    categoryLabels,
    handleFinanceEditAction,
    requestFinanceDelete,
  } = controller;
  if (!selectedFinance) return null;
  const linkedEvent = activeEvents.find((event) => event.id === selectedFinance.eventId);
  const origin = selectedFinance.automatic
    ? 'Evento automático'
    : selectedFinance.origin === 'factory_order'
      ? 'Pedido da Fábrica'
      : selectedFinance.origin === 'bank_import'
        ? 'Extrato OFX'
        : 'Manual';
  const payment =
    selectedFinance.paymentMethod === 'pix'
      ? 'Pix'
      : selectedFinance.paymentMethod === 'money'
        ? 'Dinheiro'
        : selectedFinance.paymentMethod || 'Não informada';
  return (
    <Modal title="Detalhes do lançamento" size="md" onClose={() => setSelectedFinance(null)}>
      <div className={styles.eventDetailGrid}>
        <div>
          <span className={styles.eventDetailLabel}>Tipo</span>
          <strong className={selectedFinance.type === 'revenue' ? styles.green : styles.red}>
            {selectedFinance.type === 'revenue' ? 'Receita' : 'Custo'}
          </strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Valor</span>
          <strong className={selectedFinance.type === 'revenue' ? styles.green : styles.red}>
            {selectedFinance.type === 'revenue' ? '+' : '-'} {formatBRL(selectedFinance.amount)}
          </strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Data</span>
          <strong>{safeDate(selectedFinance.date)}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Status</span>
          <strong>{getDerivedFinanceLabel(selectedFinance)}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Categoria</span>
          <strong>{categoryLabels[selectedFinance.category] || selectedFinance.category}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Origem</span>
          <strong>{origin}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Evento</span>
          <strong>{linkedEvent?.name || 'Não vinculado'}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Forma de pagamento</span>
          <strong>{payment}</strong>
        </div>
        {selectedFinance.dueDate && (
          <div>
            <span className={styles.eventDetailLabel}>Vencimento</span>
            <strong>{safeDate(selectedFinance.dueDate)}</strong>
          </div>
        )}
        {selectedFinance.settledAt && (
          <div>
            <span className={styles.eventDetailLabel}>Liquidação</span>
            <strong>{safeDate(selectedFinance.settledAt.slice(0, 10))}</strong>
          </div>
        )}
        {selectedFinance.installmentTotal && (
          <div>
            <span className={styles.eventDetailLabel}>Parcela</span>
            <strong>
              {selectedFinance.installmentNumber || 1} de {selectedFinance.installmentTotal}
            </strong>
          </div>
        )}
        {selectedFinance.bankAccount && (
          <div>
            <span className={styles.eventDetailLabel}>Conta bancária</span>
            <strong>{selectedFinance.bankAccount}</strong>
          </div>
        )}
      </div>
      <div className={styles.eventDetailNotes}>
        <span className={styles.eventDetailLabel}>Descrição</span>
        <p>{selectedFinance.description || 'Sem descrição'}</p>
      </div>
      <div className={styles.eventDetailActions}>
        <button
          className={styles.btnExport}
          type="button"
          onClick={() => {
            const entry = selectedFinance;
            setSelectedFinance(null);
            handleFinanceEditAction(entry);
          }}
        >
          Editar
        </button>
        <button className={styles.btnDanger} type="button" onClick={() => requestFinanceDelete(selectedFinance)}>
          Excluir
        </button>
      </div>
    </Modal>
  );
}
