import type { Dispatch, SetStateAction } from 'react';
import { addContractorCategory, deleteContractor, deleteContractorCategory, saveContractor } from './contractor-api';
import type { ApiFetch, Contractor, ContractorForm } from './contractor-types';

interface ContractorMutationOptions {
  apiFetch: ApiFetch;
  categories: string[];
  closeEditor: () => void;
  contractors: Contractor[];
  deleteCategoryTarget: string | null;
  deleteTargetId: string | null;
  editingId: string | null;
  form: ContractorForm;
  setCategories: Dispatch<SetStateAction<string[]>>;
  setDeleteCategoryTarget: Dispatch<SetStateAction<string | null>>;
  setDeleteTargetId: Dispatch<SetStateAction<string | null>>;
  setEmployees: Dispatch<SetStateAction<Contractor[]>>;
}

export default function useContractorMutations(options: ContractorMutationOptions) {
  async function submitContractor() {
    if (!options.form.name) return;
    const revenue = options.contractors.find((item) => item.id === options.editingId)?.totalRevenue ?? 0;
    const contractor = await saveContractor(options.apiFetch, options.editingId, options.form, revenue);
    options.setEmployees((items) =>
      options.editingId
        ? items.map((item) => (item.id === options.editingId ? contractor : item))
        : [...items, contractor],
    );
    options.closeEditor();
  }

  async function confirmDeleteContractor() {
    if (options.deleteTargetId) {
      await deleteContractor(options.apiFetch, options.deleteTargetId);
      options.setEmployees((items) => items.filter((item) => item.id !== options.deleteTargetId));
    }
    options.setDeleteTargetId(null);
  }

  async function addCategory(name: string) {
    const trimmed = name.trim();
    const alreadyExists = options.categories.some((item) => item.toLowerCase() === trimmed.toLowerCase());
    if (trimmed && !alreadyExists) {
      await addContractorCategory(options.apiFetch, trimmed);
      options.setCategories((items) =>
        [...items, trimmed].sort((first, second) => first.localeCompare(second, 'pt-BR')),
      );
    }
  }

  async function confirmDeleteCategory() {
    if (options.deleteCategoryTarget) {
      await deleteContractorCategory(options.apiFetch, options.deleteCategoryTarget);
      options.setCategories((items) => items.filter((item) => item !== options.deleteCategoryTarget));
    }
    options.setDeleteCategoryTarget(null);
  }

  return { addCategory, confirmDeleteCategory, confirmDeleteContractor, submitContractor };
}
