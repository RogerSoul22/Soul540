import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { apiFetch } from '../../../lib/api';
import { SOUL540_MENUS, type StaticMenu } from '../../../data/soul540Menus/index';
import {
  generateMenuPdf,
  loadMenuOverrides,
  saveMenuOverride,
  useMenuCategoryEditor,
  type MenuCategory,
  type MenuRecord as Menu,
} from '../../../../../../packages/screens/src/index';
export function useCardapiosController() {
  const { events } = useApp();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMenu, setPreviewMenu] = useState<Menu | null>(null);
  const [previewStatic, setPreviewStatic] = useState<StaticMenu | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingStatic, setEditingStatic] = useState<StaticMenu | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, StaticMenu>>(() =>
    loadMenuOverrides<StaticMenu>('soul540_franchise_menu_overrides'),
  );
  const [formName, setFormName] = useState('');
  const [formEventId, setFormEventId] = useState('');
  const [formHeaderText, setFormHeaderText] = useState('');
  const [formFooterText, setFormFooterText] = useState('');
  const categoryEditor = useMenuCategoryEditor();
  const {
    formCategories,
    setFormCategories,
    addCategory,
    removeCategory,
    updateCategory,
    addItem,
    removeItem,
    updateItem,
  } = categoryEditor;
  useEffect(() => {
    apiFetch('/api/menus')
      .then((response) => response.json())
      .then(setMenus)
      .catch(() => undefined);
  }, []);
  const eventMap = useMemo(() => Object.fromEntries(events.map((event) => [event.id, event.name])), [events]);
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return menus.filter(
      (menu) =>
        !query ||
        menu.name.toLowerCase().includes(query) ||
        (menu.eventId ? eventMap[menu.eventId]?.toLowerCase().includes(query) : false),
    );
  }, [eventMap, menus, search]);
  const resetForm = () => {
    setFormName('');
    setFormEventId('');
    setFormHeaderText('');
    setFormFooterText('');
    setFormCategories([]);
    setEditingId(null);
  };
  const openCreate = () => {
    resetForm();
    setEditorOpen(true);
  };
  const openEdit = (menu: Menu) => {
    setFormName(menu.name);
    setFormEventId(menu.eventId || '');
    setFormHeaderText(menu.headerText);
    setFormFooterText(menu.footerText);
    setFormCategories(JSON.parse(JSON.stringify(menu.categories)));
    setEditingId(menu.id);
    setEditorOpen(true);
  };
  const closeEditor = () => {
    setEditorOpen(false);
    resetForm();
  };
  const submitMenu = async () => {
    if (!formName.trim()) return;
    const payload = {
      name: formName.trim(),
      eventId: formEventId,
      headerText: formHeaderText,
      footerText: formFooterText,
      categories: formCategories,
    };
    const options = {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
    const response = await apiFetch(editingId ? '/api/menus/' + editingId : '/api/menus', options);
    const saved: Menu = await response.json();
    setMenus((current) =>
      editingId ? current.map((menu) => (menu.id === saved.id ? saved : menu)) : [saved, ...current],
    );
    closeEditor();
  };
  const confirmDelete = async () => {
    if (deleteId) {
      await apiFetch('/api/menus/' + deleteId, { method: 'DELETE' });
      setMenus((current) => current.filter((menu) => menu.id !== deleteId));
    }
    setDeleteId(null);
  };
  const generatePdf = useCallback(async (menu: StaticMenu) => {
    setGeneratingPdf(menu.id);
    try {
      await generateMenuPdf(menu);
    } finally {
      setGeneratingPdf(null);
    }
  }, []);
  const saveStatic = (menu: StaticMenu) => {
    setOverrides(saveMenuOverride('soul540_franchise_menu_overrides', menu.id, menu));
    setEditingStatic(null);
  };
  return {
    events,
    menus,
    filtered,
    eventMap,
    search,
    editorOpen,
    editingId,
    previewMenu,
    previewStatic,
    deleteId,
    editingStatic,
    generatingPdf,
    overrides,
    formName,
    formEventId,
    formHeaderText,
    formFooterText,
    formCategories,
    setSearch,
    setPreviewMenu,
    setPreviewStatic,
    setDeleteId,
    setEditingStatic,
    setEditorOpen,
    setFormName,
    setFormEventId,
    setFormHeaderText,
    setFormFooterText,
    openCreate,
    openEdit,
    closeEditor,
    submitMenu,
    confirmDelete,
    generatePdf,
    saveStatic,
    addCategory,
    removeCategory,
    updateCategory,
    addItem,
    removeItem,
    updateItem,
  };
}
export type CardapiosController = ReturnType<typeof useCardapiosController>;
