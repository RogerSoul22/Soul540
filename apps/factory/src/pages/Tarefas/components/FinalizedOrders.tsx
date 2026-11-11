import { Button } from '../../../../../../packages/pentagono/src/index';
import { formatQty, formatR$, getOrderKey } from '../support/task-formatters';
import type { Pedido } from '../types/task-types';
import styles from '../styles/Tarefas.module.scss';

const summary = (pedido: Pedido) =>
  pedido.itens.map((item) => `${item.nome} ${formatQty(item.quantidade)} ${item.measure}`).join(', ');

function DeleteIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function FinalizedOrders({
  pedidos,
  onDelete,
}: {
  pedidos: Pedido[];
  onDelete: (id: string) => void;
}) {
  if (!pedidos.length) return null;
  return (
    <div className={styles.finalizedSection}>
      <div className={styles.finalizedHeader}>
        <span className={styles.blockTitle}>Pedidos Finalizados</span>
        <span className={styles.columnCount}>{pedidos.length}</span>
      </div>
      <div className={styles.finalizedList}>
        {pedidos.map((pedido) => (
          <div key={getOrderKey(pedido)} className={styles.finalizedItem}>
            <div className={styles.finalizedHead}>
              {pedido.orderNumber !== undefined && <span className={styles.orderBadge}>#{pedido.orderNumber}</span>}
              <span className={styles.finalizedFilial}>{pedido.filial}</span>
              <span className={styles.finalizedCost}>R$ {formatR$(pedido.totalCost)}</span>
              <Button
                variant="ghost"
                size="icon"
                className={styles.finalizedDelete}
                onClick={() => onDelete(getOrderKey(pedido))}
                title="Excluir pedido"
                aria-label={`Excluir pedido ${pedido.orderNumber ?? pedido.filial}`}
              >
                <DeleteIcon />
              </Button>
            </div>
            <p className={styles.finalizedItens} title={summary(pedido)}>
              {summary(pedido)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
