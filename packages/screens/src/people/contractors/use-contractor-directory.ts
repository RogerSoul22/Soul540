import { useEffect, useMemo, useRef, useState } from 'react';
import { displayCategory } from './contractor-formatters';
import { loadContractorCategories, loadContractors } from './contractor-api';
import { emptyContractorForm, type ApiFetch, type Contractor, type ContractorForm } from './contractor-types';

export default function useContractorDirectory(apiFetch: ApiFetch) {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractorForm>(emptyContractorForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewingContractor, setViewingContractor] = useState<Contractor | null>(null);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContractors(apiFetch)
      .then(setContractors)
      .finally(() => setLoading(false));
    loadContractorCategories(apiFetch)
      .then(setCategories)
      .catch(() => undefined);
  }, [apiFetch]);

  useEffect(() => {
    if (showCategoryEditor) categoryInputRef.current?.focus();
  }, [showCategoryEditor]);

  const filteredContractors = useMemo(() => {
    const query = search.toLowerCase();
    return contractors.filter((contractor) => {
      const matchesSearch =
        !search || contractor.name.toLowerCase().includes(query) || contractor.email.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
      const matchesType = typeFilter === 'all' || contractor.type === typeFilter;
      const matchesCategory = !selectedCategory || displayCategory(contractor.category ?? '') === selectedCategory;
      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [contractors, search, selectedCategory, statusFilter, typeFilter]);

  const contractorsByLetter = useMemo(() => {
    const grouped = new Map<string, Contractor[]>();
    for (const contractor of [...filteredContractors].sort((first, second) =>
      first.name.localeCompare(second.name, 'pt-BR'),
    )) {
      const letter = contractor.name.charAt(0).toUpperCase() || '#';
      grouped.set(letter, [...(grouped.get(letter) ?? []), contractor]);
    }
    return grouped;
  }, [filteredContractors]);

  function openCreate() {
    setForm(emptyContractorForm);
    setEditingId(null);
    setShowEditor(true);
  }

  function openEdit(contractor: Contractor) {
    setForm(toContractorForm(contractor));
    setEditingId(contractor.id);
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setEditingId(null);
    setForm(emptyContractorForm);
  }

  return {
    categories,
    categoryInputRef,
    closeEditor,
    contractors,
    contractorsByLetter,
    deleteCategoryTarget,
    deleteTargetId,
    editingId,
    filteredContractors,
    form,
    loading,
    openCreate,
    openEdit,
    search,
    selectedCategory,
    setCategories,
    setDeleteCategoryTarget,
    setDeleteTargetId,
    setEmployees: setContractors,
    setForm,
    setSearch,
    setSelectedCategory,
    setShowCategoryEditor,
    setShowInfo,
    setStatusFilter,
    setTypeFilter,
    setViewingContractor,
    showCategoryEditor,
    showEditor,
    showInfo,
    statusFilter,
    totalActive: contractors.filter((contractor) => contractor.status === 'ativo').length,
    typeFilter,
    viewingContractor,
  };
}

function toContractorForm(contractor: Contractor): ContractorForm {
  return {
    name: contractor.name,
    type: contractor.type,
    document: contractor.document,
    documentType: contractor.documentType ?? '',
    email: contractor.email,
    phone: contractor.phone,
    city: contractor.city ?? '',
    address: contractor.address ?? '',
    maritalStatus: contractor.maritalStatus ?? '',
    profession: contractor.profession ?? '',
    category: contractor.category ?? '',
    status: contractor.status,
  };
}
