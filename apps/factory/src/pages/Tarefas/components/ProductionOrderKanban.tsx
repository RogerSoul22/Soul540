import { EmptyState } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Tarefas.module.scss';
import ProductionOrderCard from './ProductionOrderCard';
import { ALL_STATUSES, getOrderKey } from '../support/task-formatters';
import type { Pedido, PedidoStatus } from '../types/task-types';
import { SupplyOrderCard } from '../../../../../../packages/screens/src';
import type { SupplyOrderSummary } from '@soul540/contracts';
import FinalizedOrders from './FinalizedOrders';

type Props = {
  pedidosByStatus: Record<PedidoStatus, Pedido[]>;
  supplyOrders: SupplyOrderSummary[];
  supplyOrderSaving: boolean;
  onSupplyPrepare: (id: string) => Promise<void>;
  onSupplyDispatch: (
    id: string,
    items: Array<{ factorySupplyId: string; quantityToDispatch: number }>,
  ) => Promise<void>;
  onSupplyReceive: (
    id: string,
    items: Array<{ factorySupplyId: string; quantityReceived: number; franchiseSupplyId?: string }>,
  ) => Promise<void>;
  onSupplyCancel: (id: string) => Promise<void>;
  draggedId: string | null;
  dragOverCol: PedidoStatus | null;
  setDraggedId: (id: string | null) => void;
  setDragOverCol: (status: PedidoStatus | null) => void;
  onMove: (id: string, status: PedidoStatus) => void;
  onDelete: (id: string) => void;
};

export default function ProductionOrderKanban({
  pedidosByStatus,
  supplyOrders,
  supplyOrderSaving,
  onSupplyPrepare,
  onSupplyDispatch,
  onSupplyReceive,
  onSupplyCancel,
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
        {ALL_STATUSES.slice(0, 2).map((column) => {
          const columnOrders = pedidosByStatus[column.id];
          const columnSupplyOrders = supplyOrders.filter((order) =>
            column.id === 'a_preparar' ? order.status === 'submitted' : order.status === 'preparing',
          );
          return (
          <div key={column.id} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{column.label}</span>
              <span className={styles.columnCount}>{columnOrders.length + columnSupplyOrders.length}</span>
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
              {!columnOrders.length && !columnSupplyOrders.length ? (
                <EmptyState
                  variant="compact"
                  className={styles.colEmpty}
                  title="Nenhum pedido"
                  description="Arraste um card para esta coluna."
                />
              ) : (
                <>
                  {columnOrders.map((pedido) => (
                    <ProductionOrderCard
                      key={getOrderKey(pedido)}
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
                  ))}
                  {!!columnSupplyOrders.length && (
                    <div className={styles.supplyOrderGroup}>
                      <h3>Solicitações de insumos</h3>
                      {columnSupplyOrders.map((order) => (
                        <SupplyOrderCard
                          key={order.id}
                          order={order}
                          mode="factory"
                          localSupplies={[]}
                          saving={supplyOrderSaving}
                          onPrepare={onSupplyPrepare}
                          onDispatch={onSupplyDispatch}
                          onReceive={onSupplyReceive}
                          onCancel={onSupplyCancel}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          );
        })}
      </div>
      <FinalizedOrders pedidos={pedidosByStatus.entregue} onDelete={onDelete} />
    </>
  );
}
