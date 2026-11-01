import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import { Button, ConfirmModal, Modal } from '../../../../../../packages/pentagono/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

function safeDate(value: string | undefined | null) {
  if (!value) return '-';
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy', { locale: ptBR }) : '-';
}

export default function FinanceEventDetailsModal({ controller }: { controller: FinanceiroController }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { selectedEvent, setSelectedEvent, closeEventFinance, reopenEventFinance, deleteEvent } = controller;
  if (!selectedEvent) return null;
  const difference = (selectedEvent.finalValue || 0) - (selectedEvent.budget || 0);
  return (
    <Modal title={'Detalhes: ' + selectedEvent.name} size="md" onClose={() => setSelectedEvent(null)}>
      <div className={styles.eventDetailGrid}>
        <div>
          <span className={styles.eventDetailLabel}>Data</span>
          <strong>{safeDate(selectedEvent.date)}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Situação financeira</span>
          <strong>
            {selectedEvent.financialStatus === 'closed'
              ? 'Fechado'
              : selectedEvent.financialStatus === 'settled'
                ? 'Quitado'
                : selectedEvent.financialStatus === 'partial'
                  ? 'Parcial'
                  : 'Em aberto'}
          </strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Status</span>
          <strong>{selectedEvent.status || 'Não informado'}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Valor estimado</span>
          <strong>{formatBRL(selectedEvent.budget || 0)}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Deslocamento</span>
          <strong>{selectedEvent.travelCost ? formatBRL(selectedEvent.travelCost) : 'Não informado'}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Valor final</span>
          <strong>{selectedEvent.finalValue ? formatBRL(selectedEvent.finalValue) : 'Não informado'}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Diferença</span>
          <strong className={difference >= 0 ? styles.green : styles.red}>
            {selectedEvent.finalValue ? formatBRL(difference) : 'Não informado'}
          </strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Convidados</span>
          <strong>{selectedEvent.guestCount || 0}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Local</span>
          <strong>{selectedEvent.location || 'Não informado'}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Forma de pagamento</span>
          <strong>{selectedEvent.paymentMethod || 'Não informado'}</strong>
        </div>
        <div>
          <span className={styles.eventDetailLabel}>Sinal recebido</span>
          <strong>{selectedEvent.depositValue ? formatBRL(selectedEvent.depositValue) : 'Não informado'}</strong>
        </div>
      </div>
      {selectedEvent.notes && (
        <div className={styles.eventDetailNotes}>
          <span className={styles.eventDetailLabel}>Observações</span>
          <p>{selectedEvent.notes}</p>
        </div>
      )}
      <div className={styles.eventDetailActions}>
        {selectedEvent.financialCloseStatus === 'closed' ? (
          <Button
            variant="secondary"
            type="button"
            onClick={async () => {
              await reopenEventFinance(selectedEvent.id);
              setSelectedEvent(null);
            }}
          >
            Reabrir financeiro
          </Button>
        ) : (
          <Button
            variant="secondary"
            type="button"
            onClick={async () => {
              await closeEventFinance(selectedEvent.id);
              setSelectedEvent(null);
            }}
          >
            Fechar financeiro
          </Button>
        )}
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            window.location.href = '/eventos?edit=' + encodeURIComponent(selectedEvent.id);
          }}
        >
          Editar evento
        </Button>
        <Button variant="danger" type="button" onClick={() => setConfirmDelete(true)}>
          Excluir evento
        </Button>
      </div>
      {confirmDelete && (
        <ConfirmModal
          title="Excluir evento"
          message="Esta ação não pode ser desfeita. Deseja continuar?"
          variant="danger"
          onClose={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteEvent(selectedEvent.id);
            setConfirmDelete(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </Modal>
  );
}
