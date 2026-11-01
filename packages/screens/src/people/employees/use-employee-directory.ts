import { useEffect, useMemo, useState } from 'react';
import { emptyEmployeeForm, type ApiFetch, type Employee, type EmployeeForm } from './employee-types';
import { cleanName, nameInitial } from './employee-formatters';

export default function useEmployeeDirectory(apiFetch: ApiFetch) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyEmployeeForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    apiFetch('/api/employees')
      .then((response) => response.json())
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !search ||
        employee.name.toLowerCase().includes(query) ||
        employee.phone.includes(search) ||
        employee.email?.toLowerCase().includes(query) ||
        employee.cpf?.includes(search) ||
        employee.rg?.includes(search) ||
        employee.city?.toLowerCase().includes(query) ||
        employee.address?.toLowerCase().includes(query) ||
        employee.notes?.toLowerCase().includes(query) ||
        employee.pixKey?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const matchesRole = roleFilter === 'all' || employee.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [employees, roleFilter, search, statusFilter]);

  const groupedEmployees = useMemo(() => {
    const employeesByLetter = new Map<string, Employee[]>();
    const sortedEmployees = [...filteredEmployees].sort((first, second) =>
      cleanName(first.name).localeCompare(cleanName(second.name), 'pt-BR'),
    );

    for (const employee of sortedEmployees) {
      const letter = nameInitial(employee.name);
      const group = employeesByLetter.get(letter) ?? [];
      employeesByLetter.set(letter, [...group, employee]);
    }

    return employeesByLetter;
  }, [filteredEmployees]);

  function openCreate() {
    setForm(emptyEmployeeForm);
    setEditingId(null);
    setShowEditor(true);
  }

  function openEdit(employee: Employee) {
    setForm({
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      status: employee.status,
      cpf: employee.cpf ?? '',
      rg: employee.rg ?? '',
      address: employee.address ?? '',
      notes: employee.notes ?? '',
      pixKey: employee.pixKey ?? '',
      commissionRate: String(employee.commissionRate ?? 0),
      availableDays: employee.availableDays ?? [],
    });
    setEditingId(employee.id);
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setEditingId(null);
    setForm(emptyEmployeeForm);
  }

  return {
    closeEditor,
    deleteTargetId,
    editingId,
    employees,
    filteredEmployees,
    form,
    groupedEmployees,
    loading,
    openCreate,
    openEdit,
    roleFilter,
    search,
    setDeleteTargetId,
    setEmployees,
    setForm,
    setRoleFilter,
    setSearch,
    setShowEditor,
    setShowInfo,
    setStatusFilter,
    setViewingEmployee,
    showEditor,
    showInfo,
    statusFilter,
    totalActive: employees.filter((employee) => employee.status === 'ativo').length,
    viewingEmployee,
  };
}
