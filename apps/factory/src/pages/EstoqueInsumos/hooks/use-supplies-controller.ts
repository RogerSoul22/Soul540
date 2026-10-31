import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useSupplyXmlImport } from './use-supply-xml-import';
import { calcStatus, emptySupplyForm, formatCurrency, parseCurrency } from '../types/supply-types';
import type { Supply, SupplyForm, SupplyStatus } from '../types/supply-types';
export function useSuppliesController() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupplyStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplyForm>(emptySupplyForm);
  const [viewingItem, setViewingItem] = useState<Supply | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [deleteCategory, setDeleteCategory] = useState<string | null>(null);
  const [deleteSupply, setDeleteSupply] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([
      apiFetch('/api/supplies').then((response) => response.json()),
      apiFetch('/api/supply-categories').then((response) => response.json()),
    ])
      .then(([loadedSupplies, loadedCategories]) => {
        setSupplies(loadedSupplies);
        setCategories(loadedCategories);
      })
      .finally(() => setLoading(false));
  }, []);
  const xml = useSupplyXmlImport(setSupplies);
  const eventlessSearch = search.toLowerCase();
  const filtered = useMemo(
    () =>
      supplies.filter(
        (supply) =>
          (!eventlessSearch ||
            supply.name.toLowerCase().includes(eventlessSearch) ||
            supply.category.toLowerCase().includes(eventlessSearch)) &&
          (statusFilter === 'all' || supply.status === statusFilter) &&
          (!selectedCategory || supply.category === selectedCategory),
      ),
    [eventlessSearch, selectedCategory, statusFilter, supplies],
  );
  const lowStockCount = supplies.filter(
    (supply) => supply.status === 'estoque_baixo' || supply.status === 'sem_estoque',
  ).length;
  const totalValue = supplies.reduce((total, supply) => total + supply.quantity * supply.costPerUnit, 0);

  const openCreate = () => {
    setForm(emptySupplyForm);
    setEditingId(null);
    setShowModal(true);
  };
  const openEdit = (supply: Supply) => {
    setForm({
      name: supply.name,
      category: supply.category,
      measureUnit: supply.measureUnit,
      quantity: String(supply.quantity),
      minStock: String(supply.minStock),
      costPerUnit: supply.costPerUnit ? formatCurrency(String(Math.round(supply.costPerUnit * 100))) : '',
      supplier: supply.supplier,
      expirationDate: supply.expirationDate || '',
    });
    setEditingId(supply.id);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptySupplyForm);
  };
  const saveSupply = async () => {
    if (!form.name.trim()) return;
    const quantity = Number(form.quantity) || 0;
    const minStock = Number(form.minStock) || 0;
    const data = {
      ...form,
      name: form.name.trim(),
      quantity,
      minStock,
      costPerUnit: parseCurrency(form.costPerUnit),
      expirationDate: form.expirationDate || undefined,
      status: calcStatus(quantity, minStock, form.expirationDate || undefined),
    };
    const response = await apiFetch(editingId ? '/api/supplies/' + editingId : '/api/supplies', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const saved: Supply = await response.json();
    setSupplies((current) =>
      editingId ? current.map((supply) => (supply.id === saved.id ? saved : supply)) : [...current, saved],
    );
    closeModal();
  };
  const addCategory = async () => {
    const value = newCategory.trim();
    if (!value || categories.some((category) => category.toLowerCase() === value.toLowerCase())) return;
    await apiFetch('/api/supply-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: value }),
    });
    setCategories((current) => [...current, value].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    setNewCategory('');
    setShowCategoryModal(false);
  };
  const confirmDeleteSupply = async () => {
    if (deleteSupply) {
      await apiFetch('/api/supplies/' + deleteSupply, { method: 'DELETE' });
      setSupplies((current) => current.filter((supply) => supply.id !== deleteSupply));
    }
    setDeleteSupply(null);
  };
  const confirmDeleteCategory = async () => {
    if (!deleteCategory) return;
    await apiFetch('/api/supply-categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: deleteCategory }),
    });
    setCategories((current) => current.filter((category) => category !== deleteCategory));
    setDeleteCategory(null);
  };

  return {
    supplies,
    categories,
    filtered,
    loading,
    selectedCategory,
    search,
    statusFilter,
    showModal,
    editingId,
    form,
    viewingItem,
    showInfo,
    showCategoryModal,
    newCategory,
    deleteCategory,
    deleteSupply,
    lowStockCount,
    totalValue,
    setSelectedCategory,
    setSearch,
    setStatusFilter,
    setViewingItem,
    setShowInfo,
    setShowCategoryModal,
    setNewCategory,
    setDeleteCategory,
    setDeleteSupply,
    openCreate,
    openEdit,
    closeModal,
    saveSupply,
    addCategory,
    confirmDeleteSupply,
    confirmDeleteCategory,
    setForm,
    ...xml,
  };
}
export type SuppliesController = ReturnType<typeof useSuppliesController>;
