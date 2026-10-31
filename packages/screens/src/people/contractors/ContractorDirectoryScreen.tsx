import { ConfirmModal } from '@soul540/ui';
import ContractorCategoryModal from './ContractorCategoryModal';
import ContractorCategorySection from './ContractorCategorySection';
import ContractorDetailsModal from './ContractorDetailsModal';
import ContractorDirectoryHeader from './ContractorDirectoryHeader';
import ContractorDirectoryList from './ContractorDirectoryList';
import ContractorEditorModal from './ContractorEditorModal';
import ContractorInfoModal from './ContractorInfoModal';
import exportContractors from './export-contractors';
import type { ApiFetch } from './contractor-types';
import styles from './styles/ContractorDirectoryScreen.module.scss';
import useContractorDirectory from './use-contractor-directory';
import useContractorMutations from './use-contractor-mutations';

export interface ContractorDirectoryScreenProps {
  apiFetch: ApiFetch;
  exportFileName: string;
}

export default function ContractorDirectoryScreen({ apiFetch, exportFileName }: ContractorDirectoryScreenProps) {
  const directory = useContractorDirectory(apiFetch);
  const mutations = useContractorMutations({
    apiFetch,
    categories: directory.categories,
    closeEditor: directory.closeEditor,
    contractors: directory.contractors,
    deleteCategoryTarget: directory.deleteCategoryTarget,
    deleteTargetId: directory.deleteTargetId,
    editingId: directory.editingId,
    form: directory.form,
    setCategories: directory.setCategories,
    setDeleteCategoryTarget: directory.setDeleteCategoryTarget,
    setDeleteTargetId: directory.setDeleteTargetId,
    setEmployees: directory.setEmployees,
  });
  const deletingContractor = directory.contractors.find((contractor) => contractor.id === directory.deleteTargetId);

  return (
    <main className={styles.page}>
      <ContractorDirectoryHeader
        exportFileName={exportFileName}
        onCreate={directory.openCreate}
        onExport={() => exportContractors(directory.filteredContractors, exportFileName)}
        onOpenInfo={() => directory.setShowInfo(true)}
        totalActive={directory.totalActive}
        totalContractors={directory.contractors.length}
      />
      <ContractorCategorySection
        categories={directory.categories}
        contractors={directory.contractors}
        onDelete={directory.setDeleteCategoryTarget}
        onOpenEditor={() => directory.setShowCategoryEditor(true)}
        onSelect={directory.setSelectedCategory}
        selectedCategory={directory.selectedCategory}
      />
      <ContractorDirectoryList
        contractorsByLetter={directory.contractorsByLetter}
        loading={directory.loading}
        onDelete={directory.setDeleteTargetId}
        onEdit={directory.openEdit}
        onSearchChange={directory.setSearch}
        onStatusFilterChange={directory.setStatusFilter}
        onTypeFilterChange={directory.setTypeFilter}
        onView={directory.setViewingContractor}
        search={directory.search}
        statusFilter={directory.statusFilter}
        typeFilter={directory.typeFilter}
      />
      <ContractorEditorModal
        categories={directory.categories}
        editingId={directory.editingId}
        form={directory.form}
        isOpen={directory.showEditor}
        onChange={directory.setForm}
        onClose={directory.closeEditor}
        onSubmit={mutations.submitContractor}
      />
      <ContractorDetailsModal
        contractor={directory.viewingContractor}
        onClose={() => directory.setViewingContractor(null)}
        onEdit={directory.openEdit}
      />
      <ContractorCategoryModal
        inputRef={directory.categoryInputRef}
        isOpen={directory.showCategoryEditor}
        onClose={() => directory.setShowCategoryEditor(false)}
        onSubmit={mutations.addCategory}
      />
      <ContractorInfoModal open={directory.showInfo} onClose={() => directory.setShowInfo(false)} />
      {directory.deleteTargetId ? (
        <ConfirmModal
          confirmLabel="Excluir"
          message={
            <>
              Tem certeza que deseja excluir <strong>{deletingContractor?.name}</strong>? Esta ação não pode ser
              desfeita.
            </>
          }
          onClose={() => directory.setDeleteTargetId(null)}
          onConfirm={mutations.confirmDeleteContractor}
          title="Excluir contratante"
          variant="danger"
        />
      ) : null}
      {directory.deleteCategoryTarget ? (
        <ConfirmModal
          confirmLabel="Remover"
          message={
            <>
              Tem certeza que deseja remover a categoria <strong>{directory.deleteCategoryTarget}</strong>?
            </>
          }
          onClose={() => directory.setDeleteCategoryTarget(null)}
          onConfirm={mutations.confirmDeleteCategory}
          title="Remover categoria"
          variant="danger"
        />
      ) : null}
    </main>
  );
}
