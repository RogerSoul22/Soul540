import type { Dispatch, SetStateAction } from 'react';
import type { Contract as SharedContract } from '@soul540/screens';

export type Contract = SharedContract;

export interface ContractDocumentProps {
  contract: Contract;
  event: { date?: string; location?: string } | undefined;
  eventName: string;
  onClose: () => void;
}

export type EditableMenuItem = { name: string; subtitle: string; description: string };
export type EditableMenuCategory = {
  name: string;
  headers: [string, string];
  items: EditableMenuItem[];
};

export interface ContractDocumentBaseModel {
  contract: Contract;
  editing: boolean;
  generating: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
  setGenerating: Dispatch<SetStateAction<boolean>>;
  companyName: string;
  setCompanyName: Dispatch<SetStateAction<string>>;
  companyCnpj: string;
  setCompanyCnpj: Dispatch<SetStateAction<string>>;
  companyIe: string;
  setCompanyIe: Dispatch<SetStateAction<string>>;
  companyAddress: string;
  setCompanyAddress: Dispatch<SetStateAction<string>>;
  companyFantasy: string;
  setCompanyFantasy: Dispatch<SetStateAction<string>>;
  signerName: string;
  setSignerName: Dispatch<SetStateAction<string>>;
  signerCpf: string;
  setSignerCpf: Dispatch<SetStateAction<string>>;
  clientName: string;
  setClientName: Dispatch<SetStateAction<string>>;
  clientDocument: string;
  setClientDocument: Dispatch<SetStateAction<string>>;
  clientRg: string;
  setClientRg: Dispatch<SetStateAction<string>>;
  clientAddress: string;
  setClientAddress: Dispatch<SetStateAction<string>>;
  eventDate: string;
  setEventDate: Dispatch<SetStateAction<string>>;
  eventLocation: string;
  setEventLocation: Dispatch<SetStateAction<string>>;
  eventDesc: string;
  setEventDesc: Dispatch<SetStateAction<string>>;
  pricePerAdult: string;
  setPricePerAdult: Dispatch<SetStateAction<string>>;
  adultsCount: string;
  setAdultsCount: Dispatch<SetStateAction<string>>;
  pricePerChild: string;
  setPricePerChild: Dispatch<SetStateAction<string>>;
  childrenCount: string;
  setChildrenCount: Dispatch<SetStateAction<string>>;
  additionalServices: string;
  setAdditionalServices: Dispatch<SetStateAction<string>>;
  totalValue: string;
  setTotalValue: Dispatch<SetStateAction<string>>;
  paymentOptions: string;
  setPaymentOptions: Dispatch<SetStateAction<string>>;
  adultTotal: number;
  childTotal: number;
  minGuests: string;
  setMinGuests: Dispatch<SetStateAction<string>>;
  serviceType: string;
  setServiceType: Dispatch<SetStateAction<string>>;
  drinksDescription: string;
  setDrinksDescription: Dispatch<SetStateAction<string>>;
  cancellationDays: string;
  setCancellationDays: Dispatch<SetStateAction<string>>;
  pizzaTeam: string;
  setPizzaTeam: Dispatch<SetStateAction<string>>;
  drinksTeam: string;
  setDrinksTeam: Dispatch<SetStateAction<string>>;
  clause3Text: string;
  setClause3Text: Dispatch<SetStateAction<string>>;
  clause4Fines: string;
  setClause4Fines: Dispatch<SetStateAction<string>>;
  clause4Force: string;
  setClause4Force: Dispatch<SetStateAction<string>>;
  clause5Intro: string;
  setClause5Intro: Dispatch<SetStateAction<string>>;
  clause5Outro: string;
  setClause5Outro: Dispatch<SetStateAction<string>>;
  clause6Phone: string;
  setClause6Phone: Dispatch<SetStateAction<string>>;
  clause7Text: string;
  setClause7Text: Dispatch<SetStateAction<string>>;
  clause8Text: string;
  setClause8Text: Dispatch<SetStateAction<string>>;
  witness1Name: string;
  setWitness1Name: Dispatch<SetStateAction<string>>;
  witness1Cpf: string;
  setWitness1Cpf: Dispatch<SetStateAction<string>>;
  witness2Name: string;
  setWitness2Name: Dispatch<SetStateAction<string>>;
  witness2Cpf: string;
  setWitness2Cpf: Dispatch<SetStateAction<string>>;
  contractCity: string;
  setContractCity: Dispatch<SetStateAction<string>>;
  today: string;
  createdDate: string;
}

export interface ContractDocumentMenuModel {
  menuName: string;
  setMenuName: Dispatch<SetStateAction<string>>;
  menuObs: string;
  setMenuObs: Dispatch<SetStateAction<string>>;
  menuCategories: EditableMenuCategory[];
  updateCatName: (categoryIndex: number, value: string) => void;
  updateItemField: (categoryIndex: number, itemIndex: number, field: keyof EditableMenuItem, value: string) => void;
  addItem: (categoryIndex: number) => void;
  removeItem: (categoryIndex: number, itemIndex: number) => void;
  addCategory: () => void;
}

export type ContractDocumentModel = ContractDocumentBaseModel & ContractDocumentMenuModel;
