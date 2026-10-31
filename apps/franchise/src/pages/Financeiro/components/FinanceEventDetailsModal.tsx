import type { Dispatch, SetStateAction } from 'react';
import type { PizzaEvent } from '../../../types/Event';
import { Modal } from '../../../../../../packages/ui/src/index';
import styles from '../styles/Financeiro.module.scss';

type FinanceEventDetailsController = {
  selectedFinancialEvent: PizzaEvent | null;
  setSelectedFinancialEvent: Dispatch<SetStateAction<PizzaEvent | null>>;
  formatBRL: (value: number) => string;
  closeEventFinance: (eventId: string) => void | Promise<void>;
  reopenEventFinance: (eventId: string) => void | Promise<void>;
};

type FinanceEventDetailsModalProps = {
  controller: FinanceEventDetailsController;
};

export default function FinanceEventDetailsModal({ controller }: FinanceEventDetailsModalProps) {
  const { selectedFinancialEvent, setSelectedFinancialEvent, formatBRL, closeEventFinance, reopenEventFinance } =
    controller;

  return (
    <>
      {selectedFinancialEvent && (
        <Modal
          title={`Financeiro: ${selectedFinancialEvent.name}`}
          size="md"
          onClose={() => setSelectedFinancialEvent(null)}
        >
          <div className={styles.eventDetailGrid}>
            <div>
              <span className={styles.eventDetailLabel}>Valor estimado</span>
              <strong>{formatBRL(selectedFinancialEvent.budget || 0)}</strong>
            </div>
            <div>
              <span className={styles.eventDetailLabel}>Sinal recebido</span>
              <strong>{formatBRL(selectedFinancialEvent.depositValue || 0)}</strong>
            </div>
            <div>
              <span className={styles.eventDetailLabel}>Saldo em aberto</span>
              <strong>
                {formatBRL(
                  Math.max(
                    (selectedFinancialEvent.finalValue || selectedFinancialEvent.budget || 0) -
                      (selectedFinancialEvent.depositValue || 0),
                    0,
                  ),
                )}
              </strong>
            </div>
            <div>
              <span className={styles.eventDetailLabel}>Deslocamento</span>
              <strong>{formatBRL(selectedFinancialEvent.travelCost || 0)}</strong>
            </div>
            <div>
              <span className={styles.eventDetailLabel}>Valor final</span>
              <strong>{formatBRL(selectedFinancialEvent.finalValue || 0)}</strong>
            </div>
            <div>
              <span className={styles.eventDetailLabel}>Forma de pagamento</span>
              <strong>{selectedFinancialEvent.paymentMethod || 'Não informada'}</strong>
            </div>
            <div>
              <span className={styles.eventDetailLabel}>Situação</span>
              <strong>
                {selectedFinancialEvent.financialStatus === 'closed'
                  ? 'Fechado'
                  : selectedFinancialEvent.financialStatus === 'settled'
                    ? 'Quitado'
                    : selectedFinancialEvent.financialStatus === 'partial'
                      ? 'Parcial'
                      : 'Em aberto'}
              </strong>
            </div>
          </div>
          <div className={styles.eventDetailActions}>
            {selectedFinancialEvent.financialStatus === 'closed' ? (
              <button
                className={styles.btnExport}
                type="button"
                onClick={async () => {
                  await reopenEventFinance(selectedFinancialEvent.id);
                  setSelectedFinancialEvent(null);
                }}
              >
                Reabrir financeiro
              </button>
            ) : (
              <button
                className={styles.btnExport}
                type="button"
                onClick={async () => {
                  await closeEventFinance(selectedFinancialEvent.id);
                  setSelectedFinancialEvent(null);
                }}
              >
                Fechar financeiro
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Form Modal */}
    </>
  );
}
