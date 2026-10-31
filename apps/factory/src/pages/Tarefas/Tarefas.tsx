import { ROUTES } from '../../routes';
import { ConfirmModal } from '../../../../../packages/ui/src/index';
import styles from './styles/Tarefas.module.scss';
import NewProductionOrderForm from './components/NewProductionOrderForm';
import ProductionOrderFilters from './components/ProductionOrderFilters';
import ProductionOrderKanban from './components/ProductionOrderKanban';
import ProductionRecipeGrid from './components/ProductionRecipeGrid';
import { useProductionOrdersController } from './hooks/use-production-orders-controller';

export default function Tarefas() {
  const controller = useProductionOrdersController();
  const {
    recipe,
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
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>Gestão de pedidos e insumos de produção</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={() => setShowNovoPedido(true)}>
            ＋ Novo Pedido
          </button>
          <button
            className={styles.btnSecondary}
            onClick={() => window.open(`/fabrica${ROUTES.CHECKLIST_ENVIO}`, '_blank', 'noopener,noreferrer')}
          >
            Checklist envio
          </button>
          <div className={styles.saveStatus}>
            {saving && <span className={styles.saveLabel}>Salvando...</span>}
            {saved && <span className={styles.saveLabelOk}>✓ Salvo</span>}
          </div>
        </div>
      </div>
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
      <ProductionOrderKanban
        pedidosByStatus={pedidosByStatus}
        draggedId={controller.draggedId}
        dragOverCol={controller.dragOverCol}
        setDraggedId={controller.setDraggedId}
        setDragOverCol={controller.setDragOverCol}
        onMove={handleMove}
        onDelete={setDeleteConfirmId}
      />
      {showNovoPedido && (
        <div className={styles.overlay} onClick={() => setShowNovoPedido(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo Pedido</h2>
              <button className={styles.modalClose} onClick={() => setShowNovoPedido(false)}>
                ×
              </button>
            </div>
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
          </div>
        </div>
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
              <strong>{pedidos.find((order) => order.id === deleteConfirmId)?.filial || 'esta filial'}</strong>? Esta
              ação não pode ser desfeita.
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
