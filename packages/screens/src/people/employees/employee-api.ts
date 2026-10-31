import type { ApiFetch, Employee, EmployeeForm } from './employee-types';

const jsonHeaders = { 'Content-Type': 'application/json' };

export async function createEmployee(apiFetch: ApiFetch, form: EmployeeForm): Promise<Employee> {
  const response = await apiFetch('/api/employees', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(toPayload(form)),
  });

  return response.json();
}

export async function updateEmployee(apiFetch: ApiFetch, employeeId: string, form: EmployeeForm): Promise<Employee> {
  const response = await apiFetch(`/api/employees/${employeeId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(toPayload(form)),
  });

  return response.json();
}

export function deleteEmployee(apiFetch: ApiFetch, employeeId: string) {
  return apiFetch(`/api/employees/${employeeId}`, { method: 'DELETE' });
}

function toPayload(form: EmployeeForm): Omit<Employee, 'id' | 'createdAt'> {
  return {
    name: form.name,
    role: form.role,
    phone: form.phone,
    status: form.status,
    cpf: form.cpf || undefined,
    rg: form.rg || undefined,
    address: form.address || undefined,
    notes: form.notes || undefined,
    pixKey: form.pixKey || undefined,
    commissionRate: Math.min(100, Math.max(0, Number(form.commissionRate) || 0)),
    availableDays: form.availableDays.length > 0 ? form.availableDays : undefined,
  };
}
