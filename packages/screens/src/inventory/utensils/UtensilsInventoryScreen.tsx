import { ConfirmModal } from '../../../../ui/src/index';
import CategoryEditorModal from './CategoryEditorModal';
import InventoryInfoModal from './InventoryInfoModal';
import UtensilDetailsModal from './UtensilDetailsModal';
import UtensilEditorModal from './UtensilEditorModal';
import UtensilsInventoryCategories from './UtensilsInventoryCategories';
import UtensilsInventoryHeader from './UtensilsInventoryHeader';
import UtensilsInventoryList from './UtensilsInventoryList';
import type { ApiFetch } from './utensil-types';
import styles from './styles/UtensilsInventoryScreen.module.scss';
import useUtensilMutations from './use-utensil-mutations';
import useUtensilsInventory from './use-utensils-inventory';

export default function UtensilsInventoryScreen({ apiFetch }: { apiFetch: ApiFetch }) {
  const inventory = useUtensilsInventory(apiFetch);
  const mutations = useUtensilMutations({
    apiFetch,
    categories: inventory.categories,
    closeCategoryEditor: inventory.closeCategoryEditor,
    closeEditor: inventory.closeEditor,
    deleteCategoryTarget: inventory.deleteCategoryTarget,
    deleteTargetId: inventory.deleteTargetId,
    editingId: inventory.editingId,
    form: inventory.form,
    newCategory: inventory.newCategory,
    setCategories: inventory.setCategories,
    setDeleteCategoryTarget: inventory.setDeleteCategoryTarget,
    setDeleteTargetId: inventory.setDeleteTargetId,
    setUtensils: inventory.setUtensils,
  });

  return (
    <div className={styles.page}>
      <UtensilsInventoryHeader
        availableCount={inventory.availableCount}
        onCreate={inventory.openCreate}
        onOpenInfo={() => inventory.setShowInfo(true)}
        totalItems={inventory.utensils.length}
        totalValue={inventory.totalValue}
      />
      <UtensilsInventoryCategories
        categories={inventory.categories}
        onAddCategory={() => inventory.setShowCategoryModal(true)}
        onDeleteCategory={inventory.setDeleteCategoryTarget}
        onSelectCategory={(category) =>
          inventory.setSelectedCategory((current) => (current === category ? null : category))
        }
        selectedCategory={inventory.selectedCategory}
        utensils={inventory.utensils}
      />
      <UtensilsInventoryList
        items={inventory.filteredUtensils}
        loading={inventory.loading}
        onDelete={inventory.setDeleteTargetId}
        onEdit={inventory.openEdit}
        onSearchChange={inventory.setSearch}
        onStatusFilterChange={inventory.setStatusFilter}
        onView={inventory.setViewingItem}
        search={inventory.search}
        statusFilter={inventory.statusFilter}
      />
      <UtensilEditorModal
        categories={inventory.categories}
        editingId={inventory.editingId}
        form={inventory.form}
        isOpen={inventory.showEditor}
        onChange={inventory.setForm}
        onClose={inventory.closeEditor}
        onSubmit={mutations.submitUtensil}
      />
      <CategoryEditorModal
        inputRef={inventory.categoryInputRef}
        isOpen={inventory.showCategoryModal}
        newCategory={inventory.newCategory}
        onChange={inventory.setNewCategory}
        onClose={inventory.closeCategoryEditor}
        onSubmit={mutations.addCategory}
      />
      <UtensilDetailsModal
        item={inventory.viewingItem}
        onClose={() => inventory.setViewingItem(null)}
        onEdit={inventory.openEdit}
      />
      <InventoryInfoModal open={inventory.showInfo} onClose={() => inventory.setShowInfo(false)} />
      <DeletionDialogs inventory={inventory} mutations={mutations} />
    </div>
  );
}

function DeletionDialogs({
  inventory,
  mutations,
}: {
  inventory: ReturnType<typeof useUtensilsInventory>;
  mutations: ReturnType<typeof useUtensilMutations>;
}) {
  return (
    <>
      {inventory.deleteCategoryTarget && (
        <ConfirmModal
          title="Remover categoria"
          message={
            <>
              Tem certeza que deseja remover a categoria <strong>{inventory.deleteCategoryTarget}</strong>?
            </>
          }
          confirmLabel="Remover"
          variant="danger"
          onConfirm={mutations.confirmDeleteCategory}
          onClose={() => inventory.setDeleteCategoryTarget(null)}
        />
      )}
      {inventory.deleteTargetId && (
        <ConfirmModal
          title="Excluir utensílio"
          message={
            <>
              Tem certeza que deseja excluir{' '}
              <strong>{inventory.utensils.find((utensil) => utensil.id === inventory.deleteTargetId)?.name}</strong>?
              Esta ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={mutations.confirmDeleteUtensil}
          onClose={() => inventory.setDeleteTargetId(null)}
        />
      )}
    </>
  );
}
