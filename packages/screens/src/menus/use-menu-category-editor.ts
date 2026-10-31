import { useState } from 'react';
import type { MenuCategory, MenuItem } from './menu-types';

export function useMenuCategoryEditor(initial: MenuCategory[] = []) {
  const [formCategories, setFormCategories] = useState<MenuCategory[]>(initial);
  const addCategory = () =>
    setFormCategories((current) => [...current, { id: `cat-${Date.now()}`, name: 'Nova categoria', items: [] }]);
  const removeCategory = (id: string) =>
    setFormCategories((current) => current.filter((category) => category.id !== id));
  const updateCategory = (id: string, name: string) =>
    setFormCategories((current) => current.map((category) => (category.id === id ? { ...category, name } : category)));
  const addItem = (categoryId: string) =>
    setFormCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: [...category.items, { id: `item-${Date.now()}`, name: '', description: '', price: 0 }],
            }
          : category,
      ),
    );
  const removeItem = (categoryId: string, itemId: string) =>
    setFormCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
          : category,
      ),
    );
  const updateItem = (categoryId: string, itemId: string, field: keyof MenuItem, value: string | number) =>
    setFormCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
            }
          : category,
      ),
    );
  return {
    formCategories,
    setFormCategories,
    addCategory,
    removeCategory,
    updateCategory,
    addItem,
    removeItem,
    updateItem,
  };
}
