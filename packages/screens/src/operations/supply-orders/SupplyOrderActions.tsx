import { useState } from 'react';
import { Button, ConfirmModal } from '../../../../pentagono/src';
import type { SupplyOrderSummary } from '@soul540/contracts';
import type { SupplyOrderMode, SupplyOrderViewAction } from './supply-order-view';
import styles from './SupplyOrdersScreen.module.scss';

type Props = {
  order: SupplyOrderSummary;
  mode: SupplyOrderMode;
  actions: SupplyOrderViewAction[];
  appearance?: 'default' | 'kanban';
  className?: string;
  quantities: Record<string, string>;
  links: Record<string, string>;
  saving: boolean;
  onPrepare(id: string): Promise<void>;
  onDispatch(id: string, items: Array<{ factorySupplyId: string; quantityToDispatch: number }>): Promise<void>;
  onReceive(
    id: string,
    items: Array<{ factorySupplyId: string; quantityReceived: number; franchiseSupplyId?: string }>,
  ): Promise<void>;
  onCancel(id: string): Promise<void>;
};
export default function SupplyOrderActions(props: Props) {
  const {
    order,
    mode,
    actions,
    appearance = 'default',
    className,
    quantities,
    links,
    saving,
    onPrepare,
    onDispatch,
    onReceive,
    onCancel,
  } = props;
  const [confirmCancel, setConfirmCancel] = useState(false);
  return (
    <>
      <footer
        className={
          className ?? `${styles.orderActions} ${appearance === 'kanban' ? styles.kanbanOrderActions : ''}`
        }
      >
        {actions.includes('cancel') && (
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => (mode === 'factory' ? setConfirmCancel(true) : void onCancel(order.id))}
          >
            Cancelar pedido
          </Button>
        )}
        {actions.includes('start_preparing') && (
          <Button disabled={saving} onClick={() => void onPrepare(order.id)}>
            Iniciar separação
          </Button>
        )}
        {actions.includes('dispatch') && (
          <Button
            disabled={saving}
            onClick={() =>
              void onDispatch(
                order.id,
                order.items.map((item) => ({
                  factorySupplyId: item.factorySupplyId,
                  quantityToDispatch: Number(quantities[item.factorySupplyId]),
                })),
              )
            }
          >
            Registrar despacho
          </Button>
        )}
        {actions.includes('confirm_receipt') && (
          <Button
            disabled={saving}
            onClick={() =>
              void onReceive(
                order.id,
                order.items.map((item) => ({
                  factorySupplyId: item.factorySupplyId,
                  quantityReceived: Number(quantities[item.factorySupplyId]),
                  ...(links[item.factorySupplyId] && { franchiseSupplyId: links[item.factorySupplyId] }),
                })),
              )
            }
          >
            Confirmar recebimento
          </Button>
        )}
      </footer>
      {confirmCancel && (
        <ConfirmModal
          title="Cancelar pedido?"
          message={
            <>
              Tem certeza de que deseja cancelar o pedido de <strong>{order.franchiseName}</strong>? Essa ação não pode
              ser desfeita.
            </>
          }
          confirmLabel="Cancelar pedido"
          variant="danger"
          onConfirm={() => {
            setConfirmCancel(false);
            void onCancel(order.id);
          }}
          onClose={() => setConfirmCancel(false)}
        />
      )}
    </>
  );
}
