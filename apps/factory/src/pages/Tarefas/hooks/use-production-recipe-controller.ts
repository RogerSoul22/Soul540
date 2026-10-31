import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { uid } from '../support/task-formatters';
import type { Ingredient, Insumo, Recipe } from '../types/task-types';

export function useProductionRecipeController() {
  const [recipe, setRecipe] = useState<Recipe>({ ingredients: [], insumos: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiFetch('/api/production-recipes')
      .then((response) => response.json() as Promise<Recipe & { insumos?: Insumo[] }>)
      .then((data) => setRecipe({ ingredients: data.ingredients || [], insumos: data.insumos || [] }))
      .catch(() => {});
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const updateRecipe = (updated: Recipe) => {
    setRecipe(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await apiFetch('/api/production-recipes', { method: 'PUT', body: JSON.stringify(updated) });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } finally {
        setSaving(false);
      }
    }, 800);
  };
  const addIngredient = () =>
    updateRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { id: uid(), name: '', measure: 'kg', quantity: 0, cost: 0 }],
    });
  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) =>
    updateRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  const removeIngredient = (id: string) =>
    updateRecipe({ ...recipe, ingredients: recipe.ingredients.filter((item) => item.id !== id) });
  const addInsumo = () =>
    updateRecipe({ ...recipe, insumos: [...recipe.insumos, { id: uid(), name: '', measure: 'un', cost: 0 }] });
  const updateInsumo = (id: string, field: keyof Insumo, value: string | number) =>
    updateRecipe({
      ...recipe,
      insumos: recipe.insumos.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  const removeInsumo = (id: string) =>
    updateRecipe({ ...recipe, insumos: recipe.insumos.filter((item) => item.id !== id) });

  return {
    recipe,
    saving,
    saved,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addInsumo,
    updateInsumo,
    removeInsumo,
  };
}
