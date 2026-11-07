import type { Dispatch, SetStateAction } from 'react';
import type { Contract as SharedContract } from '../../../../../../packages/screens/src/index';

export type Contract = SharedContract;

export interface ContractDocumentProps {
  contract: Contract;
  event: { date?: string; location?: string } | undefined;
  eventName: string;
  onClose: () => void;
}

export interface ContractDocumentModel {
  contract: Contract;
  editing: boolean;
  generating: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
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
  contractCity: string;
  setContractCity: Dispatch<SetStateAction<string>>;
  today: string;
  createdDate: string;
}
