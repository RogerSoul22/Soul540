import type { Dispatch, SetStateAction } from 'react';
import type { DreSection } from '../../../../../../shared/contracts/types';

export type XmlFinanceItem = {
  id: string;
  name: string;
  totalValue: number;
  quantity: number;
  measureUnit: string;
  unitValue: number;
  category: string;
  selected: boolean;
};

export type CategoryGroup = {
  section: { key: string; label: string };
  categories: Array<{ key: string; label: string }>;
};

export type FinanceSupportController = {
  showXmlModal: boolean;
  setShowXmlModal: Dispatch<SetStateAction<boolean>>;
  xmlItems: XmlFinanceItem[];
  setXmlItems: Dispatch<SetStateAction<XmlFinanceItem[]>>;
  xmlSupplier: string;
  xmlDate: string;
  xmlImporting: boolean;
  handleXmlImport: () => void | Promise<void>;
  groupedCostCategories: CategoryGroup[];
  showCategoryModal: boolean;
  setShowCategoryModal: Dispatch<SetStateAction<boolean>>;
  newCategoryLabel: string;
  setNewCategoryLabel: Dispatch<SetStateAction<string>>;
  newCategorySection: DreSection;
  setNewCategorySection: Dispatch<SetStateAction<DreSection>>;
  formType: 'revenue' | 'cost';
  handleCreateCategory: () => void | Promise<void>;
  savingCategory: boolean;
};
