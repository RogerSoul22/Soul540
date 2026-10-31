import { Button, Input, Modal } from '../../../../../../packages/ui/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceSettlementModal({ controller }: { controller: FinanceiroController }) {
  const { settlementEntry, settlementDraft, updateSettlementDraft, closeSettlement, submitSettlement } = controller;
  if (!settlementEntry) return null;

  return (
    <Modal title="Registrar baixa financeira" size="md" onClose={closeSettlement}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submitSettlement();
        }}
      >
        <Input
          label="Valor efetivamente recebido/pago"
          value={settlementDraft.amount}
          inputMode="decimal"
          onChange={(event) => updateSettlementDraft('amount', event.target.value)}
        />
        <Input
          label="Data efetiva"
          type="date"
          value={settlementDraft.settledOn}
          onChange={(event) => updateSettlementDraft('settledOn', event.target.value)}
        />
        <Input
          label="Método de pagamento (opcional)"
          value={settlementDraft.paymentMethod}
          onChange={(event) => updateSettlementDraft('paymentMethod', event.target.value)}
        />
        <Input
          label="Justificativa ou referência (opcional)"
          value={settlementDraft.reason}
          onChange={(event) => updateSettlementDraft('reason', event.target.value)}
        />
        <div className={styles.eventDetailActions}>
          <Button type="button" variant="ghost" onClick={closeSettlement}>
            Cancelar
          </Button>
          <Button type="submit">Confirmar baixa</Button>
        </div>
      </form>
    </Modal>
  );
}
