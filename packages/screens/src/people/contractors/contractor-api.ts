import type { ApiFetch, Contractor, ContractorForm } from './contractor-types';

export async function loadContractors(apiFetch: ApiFetch): Promise<Contractor[]> {
  const response = await apiFetch('/api/contractors');
  return response.json();
}

export async function loadContractorCategories(apiFetch: ApiFetch): Promise<string[]> {
  const response = await apiFetch('/api/contractor-categories');
  return response.json();
}

export async function saveContractor(
  apiFetch: ApiFetch,
  id: string | null,
  form: ContractorForm,
  totalRevenue: number,
): Promise<Contractor> {
  const data = {
    name: form.name,
    type: form.type,
    document: form.document,
    documentType: form.documentType || undefined,
    email: form.email,
    phone: form.phone,
    city: form.city || undefined,
    address: form.address || undefined,
    maritalStatus: form.maritalStatus || undefined,
    profession: form.profession || undefined,
    category: form.category || undefined,
    status: form.status,
    totalRevenue,
  };
  const response = await apiFetch(id ? `/api/contractors/${id}` : '/api/contractors', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteContractor(apiFetch: ApiFetch, id: string) {
  await apiFetch(`/api/contractors/${id}`, { method: 'DELETE' });
}

export async function addContractorCategory(apiFetch: ApiFetch, name: string) {
  await apiFetch('/api/contractor-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function deleteContractorCategory(apiFetch: ApiFetch, name: string) {
  await apiFetch('/api/contractor-categories', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}
