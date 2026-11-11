import { useState } from 'react';
import type { SupplyOrderSummary } from '@soul540/contracts';
import { Badge, Card } from '../../../../pentagono/src';
import { getSupplyOrderActions, getSupplyOrderStatusLabel, type SupplyOrderMode } from './supply-order-view';
import type { FranchiseSupplyOption } from './use-supply-orders';
import SupplyOrderLine from './SupplyOrderLine';
import SupplyOrderActions from './SupplyOrderActions';
import styles from './SupplyOrdersScreen.module.scss';

type Props = {
  order: SupplyOrderSummary;
  mode: SupplyOrderMode;
  appearance?: 'default' | 'kanban';
  kanbanCardClassName?: string;
  localSupplies: FranchiseSupplyOption[];
  saving: boolean;
  onPrepare(id: string): Promise<void>;
  onDispatch(id: string, items: Array<{ factorySupplyId: string; quantityToDispatch: number }>): Promise<void>;
  onReceive(
    id: string,
    items: Array<{ factorySupplyId: string; quantityReceived: number; franchiseSupplyId?: string }>,
  ): Promise<void>;
  onCancel(id: string): Promise<void>;
};
export default function SupplyOrderCard(props: Props) {
  const {
    order,
    mode,
    appearance = 'default',
    kanbanCardClassName,
    localSupplies,
    saving,
    onPrepare,
    onDispatch,
    onReceive,
    onCancel,
  } = props;
  const actions = getSupplyOrderActions(mode, order.status);
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      order.items.map((item) => [
        item.factorySupplyId,
        String(mode === 'factory' ? item.quantityRequested : item.quantityToDispatch || item.quantityRequested),
      ]),
    ),
  );
  const [links, setLinks] = useState<Record<string, string>>({});
  const badge =
    order.status === 'received'
      ? 'green'
      : order.status === 'received_with_difference'
        ? 'amber'
        : order.status === 'cancelled'
          ? 'gray'
          : 'blue';
  const content = (
    <>
      <header className={styles.orderHeader}>
        <div className={styles.orderTitle}>
          <strong>{order.franchiseName}</strong>
          <time dateTime={order.createdAt}>
            Pedido em {new Date(order.createdAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}
          </time>
        </div>
        <Badge variant={badge}>{getSupplyOrderStatusLabel(order.status)}</Badge>
      </header>
      <div className={styles.orderLines}>
        {order.items.map((item) => (
          <SupplyOrderLine
            key={item.factorySupplyId}
            item={item}
            actions={actions}
            localSupplies={localSupplies}
            quantity={quantities[item.factorySupplyId] ?? ''}
            linkedSupplyId={links[item.factorySupplyId] ?? item.franchiseSupplyId ?? ''}
            onQuantity={(value) => setQuantities({ ...quantities, [item.factorySupplyId]: value })}
            onLink={(id) => setLinks({ ...links, [item.factorySupplyId]: id })}
          />
        ))}
      </div>
      {order.note && (
        <p className={styles.orderNote}>
          <strong>Observação</strong>
          {order.note}
        </p>
      )}
      {order.history?.length > 1 && (
        <details className={styles.history}>
          <summary>Histórico</summary>
          <ul>
            {order.history.map((entry, index) => (
              <li key={`${entry.at}-${index}`}>
                {getSupplyOrderStatusLabel(entry.status)} — {entry.actorName},{' '}
                {new Date(entry.at).toLocaleString('pt-BR')}
                {entry.note ? ` — ${entry.note}` : ''}
              </li>
            ))}
          </ul>
        </details>
      )}
      {!!actions.length && (
        <SupplyOrderActions
          order={order}
          actions={actions}
          quantities={quantities}
          links={links}
          saving={saving}
          onPrepare={onPrepare}
          onDispatch={onDispatch}
          onReceive={onReceive}
          onCancel={onCancel}
        />
      )}
    </>
  );
  if (appearance !== 'kanban') return <Card className={styles.orderCard}>{content}</Card>;
  if (kanbanCardClassName) {
    return <div className={`${styles.kanbanOrderCard} ${kanbanCardClassName}`}>{content}</div>;
  }
  return (
    <Card className={styles.orderCard}>
      <div className={styles.kanbanOrderCard}>{content}</div>
    </Card>
  );
}
