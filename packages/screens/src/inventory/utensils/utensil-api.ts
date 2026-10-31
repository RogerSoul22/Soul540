import type { ApiFetch, Utensil, UtensilForm } from './utensil-types';

const jsonHeaders = { 'Content-Type': 'application/json' };

export async function createUtensil(apiFetch: ApiFetch, form: UtensilForm): Promise<Utensil> {
  const response = await apiFetch('/api/utensils', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(toPayload(form)),
  });

  return response.json();
}

export async function updateUtensil(apiFetch: ApiFetch, utensilId: string, form: UtensilForm): Promise<Utensil> {
  const response = await apiFetch(`/api/utensils/${utensilId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(toPayload(form)),
  });

  return response.json();
}

export function deleteUtensil(apiFetch: ApiFetch, utensilId: string) {
  return apiFetch(`/api/utensils/${utensilId}`, { method: 'DELETE' });
}

export function createCategory(apiFetch: ApiFetch, category: string) {
  return apiFetch('/api/utensil-categories', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ name: category }),
  });
}

export function deleteCategory(apiFetch: ApiFetch, category: string) {
  return apiFetch('/api/utensil-categories', {
    method: 'DELETE',
    headers: jsonHeaders,
    body: JSON.stringify({ name: category }),
  });
}

function toPayload(form: UtensilForm) {
  const unitValue = Number(form.unitValue.replace(/[R$\s.]/g, '').replace(',', '.')) || undefined;

  return {
    name: form.name,
    category: form.category,
    quantity: Number(form.quantity) || 1,
    unitValue,
    location: form.location,
    status: form.status,
  };
}
