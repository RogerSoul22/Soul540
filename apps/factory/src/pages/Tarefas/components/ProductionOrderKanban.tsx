import styles from '../styles/Tarefas.module.scss';
import ProductionOrderCard from './ProductionOrderCard';
import { ALL_STATUSES, formatQty, formatR$ } from '../support/task-formatters';
import type { Pedido, PedidoStatus } from '../types/task-types';

type Props = {
  pedidosByStatus: Record<PedidoStatus, Pedido[]>;
  draggedId: string | null;
  dragOverCol: PedidoStatus | null;
  setDraggedId: (id: string | null) => void;
  setDragOverCol: (status: PedidoStatus | null) => void;
  onMove: (id: string, status: PedidoStatus) => void;
  onDelete: (id: string) => void;
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

export default function ProductionOrderKanban({
  pedidosByStatus,
  draggedId,
  dragOverCol,
  setDraggedId,
  setDragOverCol,
  onMove,
  onDelete,
}: Props) {
  return (
    <>
      <div className={styles.kanban}>
        {ALL_STATUSES.slice(0, 2).map((column) => (
          <div key={column.id} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{column.label}</span>
              <span className={styles.columnCount}>{pedidosByStatus[column.id].length}</span>
            </div>
            <div
              className={`${styles.columnBody} ${dragOverCol === column.id ? styles.columnBodyOver : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setDragOverCol(column.id);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOverCol(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedId) onMove(draggedId, column.id);
                setDraggedId(null);
                setDragOverCol(null);
              }}
            >
              {!pedidosByStatus[column.id].length ? (
                <div className={styles.colEmpty}>Nenhum pedido</div>
              ) : (
                pedidosByStatus[column.id].map((pedido) => (
                  <ProductionOrderCard
                    key={pedido.id}
                    pedido={pedido}
                    draggedId={draggedId}
                    onDelete={onDelete}
                    onMove={onMove}
                    onDragStart={setDraggedId}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverCol(null);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <FinalizedOrders pedidos={pedidosByStatus.entregue} onDelete={onDelete} />
    </>
  );
}

function FinalizedOrders({ pedidos, onDelete }: { pedidos: Pedido[]; onDelete: (id: string) => void }) {
  if (!pedidos.length) return null;
  return (
    <div className={styles.finalizedSection}>
      <div className={styles.finalizedHeader}>
        <span className={styles.blockTitle}>Pedidos Finalizados</span>
        <span className={styles.columnCount}>{pedidos.length}</span>
      </div>
      <div className={styles.finalizedList}>
        {pedidos.map((pedido) => (
          <div key={pedido.id} className={styles.finalizedItem}>
            <div className={styles.finalizedInfo}>
              {pedido.orderNumber !== undefined && <span className={styles.orderBadge}>#{pedido.orderNumber}</span>}
              <span className={styles.finalizedFilial}>{pedido.filial}</span>
              <span className={styles.finalizedItens}>
                {pedido.itens.map((item) => `${item.nome} ${formatQty(item.quantidade)} ${item.measure}`).join(', ')}
              </span>
            </div>
            <div className={styles.finalizedRight}>
              <span className={styles.finalizedCost}>Custo: R$ {formatR$(pedido.totalCost)}</span>
              <button className={styles.taskDelete} onClick={() => onDelete(pedido.id)} title="Excluir">
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
