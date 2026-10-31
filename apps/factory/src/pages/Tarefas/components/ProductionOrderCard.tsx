import styles from '../styles/Tarefas.module.scss';
import { ALL_STATUSES, formatQty, formatR$ } from '../support/task-formatters';
import type { Pedido, PedidoStatus } from '../types/task-types';

type Props = {
  pedido: Pedido;
  draggedId: string | null;
  onDelete: (id: string) => void;
  onMove: (id: string, status: PedidoStatus) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

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

export default function ProductionOrderCard({ pedido, draggedId, onDelete, onMove, onDragStart, onDragEnd }: Props) {
  const statusIndex = ALL_STATUSES.findIndex((status) => status.id === pedido.status);
  const previousStatus = ALL_STATUSES[statusIndex - 1];
  const nextStatus = ALL_STATUSES[statusIndex + 1];
  return (
    <div
      className={`${styles.taskCard} ${draggedId === pedido.id ? styles.taskCardDragging : ''}`}
      draggable
      onDragStart={(event) => {
        onDragStart(pedido.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={onDragEnd}
    >
      <div className={styles.taskTop}>
        <div>
          <div className={styles.taskTitle}>
            {pedido.orderNumber !== undefined && <span className={styles.orderBadge}>#{pedido.orderNumber}</span>}{' '}
            Filial: {pedido.filial}
          </div>
          <div className={styles.taskMeta}>
            <span>{pedido.itens.length} itens</span>
            <span>R$ {formatR$(pedido.totalCost)}</span>
          </div>
        </div>
        <button className={styles.taskDelete} onClick={() => onDelete(pedido.id)}>
          <DeleteIcon />
        </button>
      </div>
      <div className={styles.taskDesc}>
        Itens: {pedido.itens.map((item) => `${item.nome} ${formatQty(item.quantidade)} ${item.measure}`).join(', ')}
      </div>
      <div className={styles.taskRecipe}>
        <div className={styles.taskRecipeTitle}>Itens selecionados</div>
        {pedido.ingredients.length ? (
          <div className={styles.taskRecipeList}>
            {pedido.ingredients.map((item) => (
              <span key={`${pedido.id}-${item.id}`}>
                {item.name}: {formatQty(item.neededQty)} {item.measure}
              </span>
            ))}
          </div>
        ) : (
          <div className={styles.taskRecipeEmpty}>Nenhum item cadastrado</div>
        )}
        <div className={styles.taskRecipeFooter}>Custo estimado: R$ {formatR$(pedido.totalCost)}</div>
      </div>
      <div className={styles.taskMoveRow}>
        <button
          className={styles.taskMoveBtn}
          disabled={!previousStatus}
          onClick={() => previousStatus && onMove(pedido.id, previousStatus.id)}
          title={previousStatus?.label}
        >
          ‹
        </button>
        <span className={styles.taskMoveLabel}>{ALL_STATUSES[statusIndex]?.label}</span>
        <button
          className={styles.taskMoveBtn}
          disabled={!nextStatus}
          onClick={() => nextStatus && onMove(pedido.id, nextStatus.id)}
          title={nextStatus?.label}
        >
          ›
        </button>
      </div>
    </div>
  );
}
