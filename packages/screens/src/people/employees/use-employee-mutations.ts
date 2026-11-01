import type { Dispatch, SetStateAction } from 'react';
import { createEmployee, deleteEmployee, updateEmployee } from './employee-api';
import { cleanName } from './employee-formatters';
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
    const name = cleanName(form.name);
    if (!name) return;
    const payload = { ...form, name };

    if (editingId) {
      const updated = await updateEmployee(apiFetch, editingId, payload);
      setEmployees((employees) => employees.map((employee) => (employee.id === editingId ? updated : employee)));
    } else {
      const created = await createEmployee(apiFetch, payload);
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
