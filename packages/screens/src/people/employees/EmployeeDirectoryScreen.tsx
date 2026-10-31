import { ConfirmModal } from '../../../../ui/src/index';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import EmployeeDirectoryHeader from './EmployeeDirectoryHeader';
import EmployeeDirectoryList from './EmployeeDirectoryList';
import EmployeeEditorModal from './EmployeeEditorModal';
import EmployeeInfoModal from './EmployeeInfoModal';
import type { ApiFetch } from './employee-types';
import styles from './styles/EmployeeDirectoryScreen.module.scss';
import useEmployeeDirectory from './use-employee-directory';
import useEmployeeMutations from './use-employee-mutations';

export default function EmployeeDirectoryScreen({ apiFetch }: { apiFetch: ApiFetch }) {
  const directory = useEmployeeDirectory(apiFetch);
  const mutations = useEmployeeMutations({
    apiFetch,
    closeEditor: directory.closeEditor,
    deleteTargetId: directory.deleteTargetId,
    editingId: directory.editingId,
    form: directory.form,
    setDeleteTargetId: directory.setDeleteTargetId,
    setEmployees: directory.setEmployees,
  });

  return (
    <div className={styles.page}>
      <EmployeeDirectoryHeader
        onCreate={directory.openCreate}
        onOpenInfo={() => directory.setShowInfo(true)}
        totalActive={directory.totalActive}
        totalEmployees={directory.employees.length}
      />
      <EmployeeDirectoryList
        employeesByLetter={directory.groupedEmployees}
        loading={directory.loading}
        onDelete={directory.setDeleteTargetId}
        onEdit={directory.openEdit}
        onRoleFilterChange={directory.setRoleFilter}
        onSearchChange={directory.setSearch}
        onStatusFilterChange={directory.setStatusFilter}
        onView={directory.setViewingEmployee}
        roleFilter={directory.roleFilter}
        search={directory.search}
        statusFilter={directory.statusFilter}
        total={directory.filteredEmployees.length}
      />
      <EmployeeEditorModal
        editingId={directory.editingId}
        form={directory.form}
        isOpen={directory.showEditor}
        onChange={directory.setForm}
        onClose={directory.closeEditor}
        onSubmit={mutations.submitEmployee}
      />
      <EmployeeDetailsModal
        employee={directory.viewingEmployee}
        onClose={() => directory.setViewingEmployee(null)}
        onEdit={directory.openEdit}
      />
      <EmployeeInfoModal open={directory.showInfo} onClose={() => directory.setShowInfo(false)} />
      {directory.deleteTargetId && (
        <ConfirmModal
          title="Excluir funcionário"
          message={
            <>
              Tem certeza que deseja excluir{' '}
              <strong>{directory.employees.find((employee) => employee.id === directory.deleteTargetId)?.name}</strong>?
              Esta ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={mutations.confirmDeleteEmployee}
          onClose={() => directory.setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
