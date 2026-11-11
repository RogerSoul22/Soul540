import { Select } from '../../../../pentagono/src';
import type { SupplyOrderLine as Line } from '@soul540/contracts';
import type { FranchiseSupplyOption } from './use-supply-orders';
import type { SupplyOrderViewAction } from './supply-order-view';

type Props = {
  item: Line;
  actions: SupplyOrderViewAction[];
  localSupplies: FranchiseSupplyOption[];
  quantity: string;
  linkedSupplyId: string;
  onQuantity(value: string): void;
  onLink(id: string): void;
};
export default function SupplyOrderLine({
  item,
  actions,
  localSupplies,
  quantity,
  linkedSupplyId,
  onQuantity,
  onLink,
}: Props) {
  const candidates = localSupplies.filter(
    (supply) =>
      supply.name === item.factorySupplyName &&
      supply.measureUnit === item.measureUnit &&
      (!supply.factorySupplyId || supply.factorySupplyId === item.factorySupplyId),
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
      <span>
        {item.factorySupplyName} ({item.measureUnit})
      </span>
      <span>
        Solicitado: {item.quantityRequested}
        {item.quantityToDispatch > 0 && ` · Enviado: ${item.quantityToDispatch}`}
        {item.quantityReceived !== undefined && ` · Recebido: ${item.quantityReceived}`}
      </span>
      {(actions.includes('dispatch') || actions.includes('confirm_receipt')) && (
        <div style={{ display: 'grid', gap: 6 }}>
          <input
            aria-label={`Quantidade: ${item.factorySupplyName}`}
            type="number"
            min="0"
            max={actions.includes('dispatch') ? item.quantityRequested : item.quantityToDispatch}
            step="any"
            value={quantity}
            onChange={(event) => onQuantity(event.target.value)}
          />
          {actions.includes('confirm_receipt') && (
            <Select
              aria-label={`Estoque local: ${item.factorySupplyName}`}
              value={linkedSupplyId}
              onChange={(event) => onLink(event.target.value)}
            >
              <option value="">Criar novo item de estoque</option>
              {candidates.map((supply) => (
                <option key={supply.id} value={supply.id}>
                  Somar em {supply.name} ({supply.quantity})
                </option>
              ))}
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
