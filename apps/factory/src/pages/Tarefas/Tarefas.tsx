import { ROUTES } from '../../routes';
import { Button, ConfirmModal, Modal, PageHeader, SkeletonContent } from '../../../../../packages/pentagono/src/index';
import { useSupplyOrders } from '../../../../../packages/screens/src';
import { apiFetch } from '../../lib/api';
import styles from './styles/Tarefas.module.scss';
import NewProductionOrderForm from './components/NewProductionOrderForm';
import ProductionOrderFilters from './components/ProductionOrderFilters';
import ProductionOrderKanban from './components/ProductionOrderKanban';
import ProductionRecipeGrid from './components/ProductionRecipeGrid';
import { useProductionOrdersController } from './hooks/use-production-orders-controller';
import { getOrderKey } from './support/task-formatters';

export default function Tarefas() {
  const controller = useProductionOrdersController();
  const supplyOrders = useSupplyOrders(apiFetch, 'factory');
  const {
    recipe,
    loading,
    availableEvents,
    saving,
    saved,
    pedidos,
    showNovoPedido,
    setShowNovoPedido,
    deleteConfirmId,
    setDeleteConfirmId,
    orderSearchMode,
    orderSearchTerm,
    selectedOrderId,
    pedidosByStatus,
    ordersForAlphabeticalSelection,
    hasActiveOrderFilter,
    setOrderSearchTerm,
    setSelectedOrderId,
    handleOrderSearchModeChange,
    handleClearOrderFilters,
    handleCreatePedido,
    handleMove,
    handleDeletePedido,
  } = controller;
  const pedidoToDelete = pedidos.find((order) => getOrderKey(order) === deleteConfirmId);
  return (
    <div className={styles.page}>
      <PageHeader
        title="Pedidos"
        subtitle="Gestão de pedidos e insumos de produção"
        actions={
          <>
            <Button variant="primary" onClick={() => setShowNovoPedido(true)}>
              ＋ Novo Pedido
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.open(`/fabrica${ROUTES.CHECKLIST_ENVIO}`, '_blank', 'noopener,noreferrer')}
            >
              Checklist envio
            </Button>
            <div className={styles.saveStatus}>
              {saving && <span className={styles.saveLabel}>Salvando...</span>}
              {saved && <span className={styles.saveLabelOk}>✓ Salvo</span>}
            </div>
          </>
        }
      />
      <ProductionOrderFilters
        mode={orderSearchMode}
        term={orderSearchTerm}
        selectedId={selectedOrderId}
        orders={ordersForAlphabeticalSelection}
        hasFilter={hasActiveOrderFilter}
        onTermChange={setOrderSearchTerm}
        onSelectedChange={setSelectedOrderId}
        onModeChange={handleOrderSearchModeChange}
        onClear={handleClearOrderFilters}
      />
      {!!supplyOrders.error && (
        <div role="alert">
          {supplyOrders.error}{' '}
          <Button variant="secondary" size="sm" onClick={() => void supplyOrders.refresh()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {loading || supplyOrders.loading ? (
        <SkeletonContent variant="cards" label="Carregando pedidos..." />
      ) : (
        <ProductionOrderKanban
          pedidosByStatus={pedidosByStatus}
          supplyOrders={supplyOrders.orders}
          supplyOrderSaving={supplyOrders.saving}
          onSupplyPrepare={(id) => runSupplyOrder(() => supplyOrders.prepare(id))}
          onSupplyDispatch={(id, items) => runSupplyOrder(() => supplyOrders.dispatch(id, { items }))}
          onSupplyReceive={(id, items) => runSupplyOrder(() => supplyOrders.receive(id, { items }))}
          onSupplyCancel={(id) => runSupplyOrder(() => supplyOrders.cancel(id))}
          draggedId={controller.draggedId}
          dragOverCol={controller.dragOverCol}
          setDraggedId={controller.setDraggedId}
          setDragOverCol={controller.setDragOverCol}
          onMove={handleMove}
          onDelete={setDeleteConfirmId}
        />
      )}
      {showNovoPedido && (
        <Modal title="Novo Pedido" onClose={() => setShowNovoPedido(false)} closeOnOverlay maxWidth={420} flush>
          <div className={styles.modalBody}>
            <NewProductionOrderForm
              ingredients={recipe.ingredients}
              insumos={recipe.insumos}
              events={availableEvents}
              onSave={async (pedido) => {
                await handleCreatePedido(pedido);
                setShowNovoPedido(false);
              }}
            />
          </div>
        </Modal>
      )}
      <ProductionRecipeGrid
        ingredients={recipe.ingredients}
        insumos={recipe.insumos}
        onAddIngredient={controller.addIngredient}
        onUpdateIngredient={controller.updateIngredient}
        onRemoveIngredient={controller.removeIngredient}
        onAddInsumo={controller.addInsumo}
        onUpdateInsumo={controller.updateInsumo}
        onRemoveInsumo={controller.removeInsumo}
      />
      {deleteConfirmId && (
        <ConfirmModal
          title="Excluir Pedido"
          message={
            <>
              Tem certeza que deseja excluir o pedido de{' '}
              <strong>{pedidoToDelete?.filial || 'esta filial'}</strong>? Esta ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={async () => {
            await handleDeletePedido(deleteConfirmId);
            setDeleteConfirmId(null);
          }}
          onClose={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}

async function runSupplyOrder(action: () => Promise<unknown>) {
  try {
    await action();
  } catch {
    // The supply-orders hook exposes request failures in its error state.
  }
}
