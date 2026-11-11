import { useState } from 'react';
import type { SupplyOrderSummary } from '@soul540/contracts';
import { Badge, Card } from '../../../../pentagono/src';
import { getSupplyOrderActions, getSupplyOrderStatusLabel, type SupplyOrderMode } from './supply-order-view';
import type { FranchiseSupplyOption } from './use-supply-orders';
import SupplyOrderLine from './SupplyOrderLine';
import SupplyOrderActions from './SupplyOrderActions';

type Props = {
  order: SupplyOrderSummary;
  mode: SupplyOrderMode;
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
  const { order, mode, localSupplies, saving, onPrepare, onDispatch, onReceive, onCancel } = props;
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
  return (
    <Card>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <strong>{order.franchiseName}</strong>
          <div>Pedido de {new Date(order.createdAt).toLocaleString('pt-BR')}</div>
        </div>
        <Badge variant={badge}>{getSupplyOrderStatusLabel(order.status)}</Badge>
      </header>
      <div style={{ display: 'grid', gap: 8, margin: '16px 0' }}>
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
      {order.note && <p>Observação: {order.note}</p>}
      {order.history?.length > 1 && (
        <details>
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
    </Card>
  );
}
