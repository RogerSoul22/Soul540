import { useState } from 'react';
import { SOUL540_MENUS } from '../../../data/soul540Menus/index';
import { buildMenuCategories } from '../support/contract-document-menu-data';
import type {
  Contract,
  ContractDocumentMenuModel,
  EditableMenuItem,
  EditableMenuCategory,
} from '../types/contract-document-types';

export function useContractDocumentMenu(contract: Contract): ContractDocumentMenuModel {
  const initialMenu = contract.menuId ? SOUL540_MENUS.find((menu) => menu.id === contract.menuId) : undefined;
  const [menuName, setMenuName] = useState(initialMenu?.name || '');
  const [menuObs, setMenuObs] = useState(
    initialMenu?.obs ||
      'O serviço será realizado em formato coquetel e rodízio, com garçons servindo' +
        'fatias aos convidados e mesa de apoio disponível para autoatendimento.',
  );
  const [menuCategories, setMenuCategories] = useState<EditableMenuCategory[]>(() => buildMenuCategories(initialMenu));

  const updateCatName = (categoryIndex: number, value: string) =>
    setMenuCategories((prev) =>
      prev.map((category, index) => (index === categoryIndex ? { ...category, name: value } : category)),
    );
  const updateItemField = (categoryIndex: number, itemIndex: number, field: keyof EditableMenuItem, value: string) =>
    setMenuCategories((prev) =>
      prev.map((category, categoryIndexValue) =>
        categoryIndexValue !== categoryIndex
          ? category
          : {
              ...category,
              items: category.items.map((item, index) => (index !== itemIndex ? item : { ...item, [field]: value })),
            },
      ),
    );
  const addItem = (categoryIndex: number) =>
    setMenuCategories((prev) =>
      prev.map((category, index) =>
        index !== categoryIndex
          ? category
          : {
              ...category,
              items: [...category.items, { name: '', subtitle: '', description: '' }],
            },
      ),
    );
  const removeItem = (categoryIndex: number, itemIndex: number) =>
    setMenuCategories((prev) =>
      prev.map((category, index) =>
        index !== categoryIndex
          ? category
          : {
              ...category,
              items: category.items.filter((_, itemIndexValue) => itemIndexValue !== itemIndex),
            },
      ),
    );
  const addCategory = () =>
    setMenuCategories((prev) => [...prev, { name: 'Nova Categoria', headers: ['Item', 'Descrição'], items: [] }]);

  return {
    menuName,
    setMenuName,
    menuObs,
    setMenuObs,
    menuCategories,
    updateCatName,
    updateItemField,
    addItem,
    removeItem,
    addCategory,
  };
}
