import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useContractDocumentClauses } from './use-contract-document-clauses';
import type { ContractDocumentProps, ContractDocumentBaseModel } from '../types/contract-document-types';
export function useContractDocumentModel({
  contract,
  event,
}: Pick<ContractDocumentProps, 'contract' | 'event'>): ContractDocumentBaseModel {
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [companyName, setCompanyName] = useState('Soul Negócios Eventos e Consultoria Ltda');
  const [companyCnpj, setCompanyCnpj] = useState('37.763.790/0001-77');
  const [companyIe, setCompanyIe] = useState('798.871.206.119');
  const [companyAddress, setCompanyAddress] = useState(
    'Rua Alameda dos Lírios 515 / Jardim Simus / Sorocaba – SP / CEP 18055141',
  );
  const [companyFantasy, setCompanyFantasy] = useState('Soul 540 Pizzas');
  const [signerName, setSignerName] = useState('Rogério Narciso Gomes');
  const [signerCpf, setSignerCpf] = useState('148.778.078-88');
  const [clientName, setClientName] = useState(contract.clientName);
  const [clientDocument, setClientDocument] = useState(contract.clientDocument || '');
  const [clientRg, setClientRg] = useState(contract.clientRg || '');
  const [clientAddress, setClientAddress] = useState(contract.clientAddress || '');
  const [eventDate, setEventDate] = useState(
    event?.date ? format(parseISO(event.date), 'dd/MM/yyyy', { locale: ptBR }) : '',
  );
  const [eventLocation, setEventLocation] = useState(event?.location || '');
  const [eventDesc, setEventDesc] = useState(contract.description || '');
  const [pricePerAdult, setPricePerAdult] = useState(contract.pricePerAdult?.toFixed(2) || '');
  const [adultsCount, setAdultsCount] = useState(contract.adultsCount?.toString() || '');
  const [pricePerChild, setPricePerChild] = useState(contract.pricePerChild?.toFixed(2) || '');
  const [childrenCount, setChildrenCount] = useState(contract.childrenCount?.toString() || '');
  const [additionalServices, setAdditionalServices] = useState(contract.additionalServices || '');
  const [totalValue, setTotalValue] = useState(
    contract.value > 0 ? contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
  );
  const [paymentOptions, setPaymentOptions] = useState(
    contract.paymentConditions ||
      'Opção 1: 30% na assinatura via Pix + saldo no dia do evento via Pix.\nOpção 2:' +
        'Parcelamento em até 2x no cartão (link enviado pela CONTRATADA).',
  );
  const adultTotal = (parseFloat(pricePerAdult.replace(',', '.')) || 0) * (parseInt(adultsCount) || 0);
  const childTotal = (parseFloat(pricePerChild.replace(',', '.')) || 0) * (parseInt(childrenCount) || 0);
  const [minGuests, setMinGuests] = useState(contract.minGuests?.toString() || contract.adultsCount?.toString() || '');
  const [serviceType, setServiceType] = useState(contract.serviceType || 'self service e coquetel');
  const [drinksDescription, setDrinksDescription] = useState(contract.drinksDescription || '');
  const [cancellationDays, setCancellationDays] = useState(contract.cancellationDays?.toString() || '30');
  const [pizzaTeam, setPizzaTeam] = useState(String(contract.pizzaTeam || ''));
  const [drinksTeam, setDrinksTeam] = useState(String(contract.drinksTeam || ''));
  const clauses = useContractDocumentClauses();
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const createdDate = format(parseISO(contract.createdAt), 'dd/MM/yyyy', { locale: ptBR });
  return {
    ...clauses,
    contract,
    editing,
    generating,
    setEditing,
    setGenerating,
    companyName,
    setCompanyName,
    companyCnpj,
    setCompanyCnpj,
    companyIe,
    setCompanyIe,
    companyAddress,
    setCompanyAddress,
    companyFantasy,
    setCompanyFantasy,
    signerName,
    setSignerName,
    signerCpf,
    setSignerCpf,
    clientName,
    setClientName,
    clientDocument,
    setClientDocument,
    clientRg,
    setClientRg,
    clientAddress,
    setClientAddress,
    eventDate,
    setEventDate,
    eventLocation,
    setEventLocation,
    eventDesc,
    setEventDesc,
    pricePerAdult,
    setPricePerAdult,
    adultsCount,
    setAdultsCount,
    pricePerChild,
    setPricePerChild,
    childrenCount,
    setChildrenCount,
    additionalServices,
    setAdditionalServices,
    totalValue,
    setTotalValue,
    paymentOptions,
    setPaymentOptions,
    adultTotal,
    childTotal,
    minGuests,
    setMinGuests,
    serviceType,
    setServiceType,
    drinksDescription,
    setDrinksDescription,
    cancellationDays,
    setCancellationDays,
    pizzaTeam,
    setPizzaTeam,
    drinksTeam,
    setDrinksTeam,
    today,
    createdDate,
  };
}
