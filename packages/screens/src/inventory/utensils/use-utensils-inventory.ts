import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCurrency } from './currency';
import { emptyUtensilForm, type ApiFetch, type Utensil, type UtensilForm } from './utensil-types';

export default function useUtensilsInventory(apiFetch: ApiFetch) {
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UtensilForm>(emptyUtensilForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<Utensil | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch('/api/utensils')
      .then((response) => response.json())
      .then(setUtensils)
      .finally(() => setLoading(false));
    apiFetch('/api/utensil-categories')
      .then((response) => response.json())
      .then(setCategories)
      .catch(() => {});
  }, [apiFetch]);

  useEffect(() => {
    if (showCategoryModal) categoryInputRef.current?.focus();
  }, [showCategoryModal]);

  const filteredUtensils = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return utensils.filter((utensil) => {
      const matchesSearch =
        !search ||
        utensil.name.toLowerCase().includes(normalizedSearch) ||
        utensil.category.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || utensil.status === statusFilter;
      const matchesCategory = !selectedCategory || utensil.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [search, selectedCategory, statusFilter, utensils]);

  const availableCount = utensils.filter((utensil) => utensil.status === 'disponivel').length;
  const totalValue = utensils.reduce((total, utensil) => total + (utensil.unitValue ?? 0) * utensil.quantity, 0);

  function openCreate() {
    setForm(emptyUtensilForm);
    setEditingId(null);
    setShowEditor(true);
  }

  function openEdit(utensil: Utensil) {
    setForm({
      name: utensil.name,
      category: utensil.category,
      quantity: String(utensil.quantity),
      unitValue: utensil.unitValue ? formatCurrency(String(Math.round(utensil.unitValue * 100))) : '',
      location: utensil.location,
      status: utensil.status,
    });
    setEditingId(utensil.id);
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setEditingId(null);
    setForm(emptyUtensilForm);
  }

  function closeCategoryEditor() {
    setNewCategory('');
    setShowCategoryModal(false);
  }

  return {
    availableCount,
    categories,
    categoryInputRef,
    closeCategoryEditor,
    closeEditor,
    deleteCategoryTarget,
    deleteTargetId,
    editingId,
    filteredUtensils,
    form,
    loading,
    newCategory,
    openCreate,
    openEdit,
    search,
    selectedCategory,
    setCategories,
    setDeleteCategoryTarget,
    setDeleteTargetId,
    setForm,
    setNewCategory,
    setSearch,
    setSelectedCategory,
    setShowCategoryModal,
    setShowInfo,
    setStatusFilter,
    setUtensils,
    setViewingItem,
    showCategoryModal,
    showEditor,
    showInfo,
    statusFilter,
    totalValue,
    utensils,
    viewingItem,
  };
}
