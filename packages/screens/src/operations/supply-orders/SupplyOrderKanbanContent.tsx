import type { SupplyOrderSummary } from '@soul540/contracts';
import type { SupplyOrderViewAction } from './supply-order-view';
import { getSupplyOrderStatusLabel } from './supply-order-view';
import SupplyOrderActions from './SupplyOrderActions';
import styles from './SupplyOrdersScreen.module.scss';

export type SupplyOrderKanbanClasses = {
  taskTop: string;
  taskTitle: string;
  taskMeta: string;
  taskDesc: string;
  taskRecipe: string;
  taskRecipeTitle: string;
  taskRecipeList: string;
  taskMoveRow: string;
};

type Props = {
  order: SupplyOrderSummary;
  actions: SupplyOrderViewAction[];
  classes: SupplyOrderKanbanClasses;
  quantities: Record<string, string>;
  links: Record<string, string>;
  saving: boolean;
  onQuantity(id: string, value: string): void;
  onPrepare(id: string): Promise<void>;
  onDispatch(id: string, items: Array<{ factorySupplyId: string; quantityToDispatch: number }>): Promise<void>;
  onReceive(
    id: string,
    items: Array<{ factorySupplyId: string; quantityReceived: number; franchiseSupplyId?: string }>,
  ): Promise<void>;
  onCancel(id: string): Promise<void>;
};

export default function SupplyOrderKanbanContent({
  order,
  actions,
  classes,
  quantities,
  links,
  saving,
  onQuantity,
  onPrepare,
  onDispatch,
  onReceive,
  onCancel,
}: Props) {
  return (
    <>
      <div className={classes.taskTop}>
        <div>
          <div className={classes.taskTitle}>Filial: {order.franchiseName}</div>
          <div className={classes.taskMeta}>
            <span>
              {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
            </span>
            <span>{getSupplyOrderStatusLabel(order.status)}</span>
          </div>
        </div>
      </div>
      <div className={classes.taskDesc}>
        Itens:{' '}
        {order.items
          .map((item) => `${item.factorySupplyName} ${item.quantityRequested} ${item.measureUnit}`)
          .join(', ')}
      </div>
      <div className={classes.taskRecipe}>
        <div className={classes.taskRecipeTitle}>Itens selecionados</div>
        <div className={classes.taskRecipeList}>
          {order.items.map((item) => (
            <div className={styles.kanbanOrderItem} key={item.factorySupplyId}>
              <span>
                {item.factorySupplyName}: {item.quantityRequested} {item.measureUnit}
              </span>
              {actions.includes('dispatch') && (
                <input
                  className={styles.quantityInput}
                  aria-label={`Quantidade: ${item.factorySupplyName}`}
                  type="number"
                  min="0"
                  max={item.quantityRequested}
                  step="any"
                  value={quantities[item.factorySupplyId] ?? ''}
                  onChange={(event) => onQuantity(item.factorySupplyId, event.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        {order.note && <div className={styles.kanbanOrderNote}>{order.note}</div>}
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
      </div>
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
          className={classes.taskMoveRow}
        />
      )}
    </>
  );
}
