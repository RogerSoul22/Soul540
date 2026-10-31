import type { Dispatch, SetStateAction } from 'react';
import { createEmployee, deleteEmployee, updateEmployee } from './employee-api';
import type { ApiFetch, Employee, EmployeeForm } from './employee-types';

interface EmployeeMutationOptions {
  apiFetch: ApiFetch;
  closeEditor: () => void;
  deleteTargetId: string | null;
  editingId: string | null;
  form: EmployeeForm;
  setDeleteTargetId: Dispatch<SetStateAction<string | null>>;
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
}

export default function useEmployeeMutations({
  apiFetch,
  closeEditor,
  deleteTargetId,
  editingId,
  form,
  setDeleteTargetId,
  setEmployees,
}: EmployeeMutationOptions) {
  async function submitEmployee() {
    if (!form.name) return;

    if (editingId) {
      const updated = await updateEmployee(apiFetch, editingId, form);
      setEmployees((employees) => employees.map((employee) => (employee.id === editingId ? updated : employee)));
    } else {
      const created = await createEmployee(apiFetch, form);
      setEmployees((employees) => [...employees, created]);
    }

    closeEditor();
  }

  async function confirmDeleteEmployee() {
    if (deleteTargetId) {
      await deleteEmployee(apiFetch, deleteTargetId);
      setEmployees((employees) => employees.filter((employee) => employee.id !== deleteTargetId));
    }

    setDeleteTargetId(null);
  }

  return { confirmDeleteEmployee, submitEmployee };
}
