import type { Dispatch, SetStateAction } from 'react';
import { createCategory, createUtensil, deleteCategory, deleteUtensil, updateUtensil } from './utensil-api';
import type { ApiFetch, Utensil, UtensilForm } from './utensil-types';

interface UtensilMutationOptions {
  apiFetch: ApiFetch;
  categories: string[];
  closeCategoryEditor: () => void;
  closeEditor: () => void;
  deleteCategoryTarget: string | null;
  deleteTargetId: string | null;
  editingId: string | null;
  form: UtensilForm;
  newCategory: string;
  setCategories: Dispatch<SetStateAction<string[]>>;
  setDeleteCategoryTarget: Dispatch<SetStateAction<string | null>>;
  setDeleteTargetId: Dispatch<SetStateAction<string | null>>;
  setUtensils: Dispatch<SetStateAction<Utensil[]>>;
}

export default function useUtensilMutations({
  apiFetch,
  categories,
  closeCategoryEditor,
  closeEditor,
  deleteCategoryTarget,
  deleteTargetId,
  editingId,
  form,
  newCategory,
  setCategories,
  setDeleteCategoryTarget,
  setDeleteTargetId,
  setUtensils,
}: UtensilMutationOptions) {
  async function submitUtensil() {
    if (!form.name) return;

    if (editingId) {
      const updated = await updateUtensil(apiFetch, editingId, form);
      setUtensils((current) => current.map((utensil) => (utensil.id === editingId ? updated : utensil)));
    } else {
      const created = await createUtensil(apiFetch, form);
      setUtensils((current) => [...current, created]);
    }

    closeEditor();
  }

  async function addCategory() {
    const trimmedCategory = newCategory.trim();
    const categoryExists = categories.some((category) => category.toLowerCase() === trimmedCategory.toLowerCase());

    if (trimmedCategory && !categoryExists) {
      await createCategory(apiFetch, trimmedCategory);
      setCategories((current) =>
        [...current, trimmedCategory].sort((first, second) => first.localeCompare(second, 'pt-BR')),
      );
    }

    closeCategoryEditor();
  }

  async function confirmDeleteUtensil() {
    if (deleteTargetId) {
      await deleteUtensil(apiFetch, deleteTargetId);
      setUtensils((current) => current.filter((utensil) => utensil.id !== deleteTargetId));
    }

    setDeleteTargetId(null);
  }

  async function confirmDeleteCategory() {
    if (deleteCategoryTarget) {
      await deleteCategory(apiFetch, deleteCategoryTarget);
      setCategories((current) => current.filter((category) => category !== deleteCategoryTarget));
    }

    setDeleteCategoryTarget(null);
  }

  return { addCategory, confirmDeleteCategory, confirmDeleteUtensil, submitUtensil };
}
