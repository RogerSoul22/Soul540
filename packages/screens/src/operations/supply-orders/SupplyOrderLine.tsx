import { Select } from '../../../../pentagono/src';
import type { SupplyOrderLine as Line } from '@soul540/contracts';
import type { FranchiseSupplyOption } from './use-supply-orders';
import type { SupplyOrderViewAction } from './supply-order-view';
import styles from './SupplyOrdersScreen.module.scss';

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
    <div className={styles.orderLine}>
      <div className={styles.supplyName}>
        <strong>{item.factorySupplyName}</strong>
        <span>{item.measureUnit}</span>
      </div>
      <div className={styles.quantitySummary}>
        <span>Solicitado <strong>{item.quantityRequested}</strong></span>
        {item.quantityToDispatch > 0 && <span>Enviado <strong>{item.quantityToDispatch}</strong></span>}
        {item.quantityReceived !== undefined && <span>Recebido <strong>{item.quantityReceived}</strong></span>}
      </div>
      {(actions.includes('dispatch') || actions.includes('confirm_receipt')) && (
        <div className={styles.orderLineInputs}>
          <input
            className={styles.quantityInput}
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
              className={styles.stockSelect}
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
