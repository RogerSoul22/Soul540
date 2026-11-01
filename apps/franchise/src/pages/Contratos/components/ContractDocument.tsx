import { DocumentViewer } from '../../../../../../packages/pentagono/src/index';
import { useCallback, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from '../styles/ContractDocument.module.scss';
import { ContractDocumentClauses } from './ContractDocumentClauses';
import { ContractDocumentHeader } from './ContractDocumentHeader';
import { ContractDocumentMenu } from './ContractDocumentMenu';
import { ContractDocumentSignatures } from './ContractDocumentSignatures';
import { ContractDocumentToolbar } from './ContractDocumentToolbar';
import type { ContractDocumentModel, ContractDocumentProps } from '../types/contract-document-types';

export type { Contract } from '../types/contract-document-types';

export default function ContractDocument({ contract, event, onClose }: ContractDocumentProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [companyName, setCompanyName] = useState('Soul Negócios Eventos e Consultoria Ltda');
  const [companyCnpj, setCompanyCnpj] = useState('37.763.790/0001-77');
  const [companyIe, setCompanyIe] = useState('798.871.206.119');
  const [companyAddress, setCompanyAddress] = useState(
    'Rua Alameda dos Lírios 515 / Jardim Simus / Campinas – SP / CEP 18055141',
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
  const adultTotal = (parseFloat(pricePerAdult.replace(',', '.')) || 0) * (parseInt(adultsCount) || 0);
  const childTotal = (parseFloat(pricePerChild.replace(',', '.')) || 0) * (parseInt(childrenCount) || 0);
  const [minGuests, setMinGuests] = useState(contract.minGuests?.toString() || contract.adultsCount?.toString() || '');
  const [serviceType, setServiceType] = useState(contract.serviceType || 'self service e coquetel');
  const [drinksDescription, setDrinksDescription] = useState(contract.drinksDescription || '');
  const [cancellationDays, setCancellationDays] = useState(contract.cancellationDays?.toString() || '30');
  const [pizzaTeam, setPizzaTeam] = useState<string>(contract.pizzaTeam?.toString() || '');
  const [drinksTeam, setDrinksTeam] = useState<string>(contract.drinksTeam?.toString() || '');
  const [contractCity, setContractCity] = useState('Itu/SP');
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const createdDate = format(parseISO(contract.createdAt), 'dd/MM/yyyy', {
    locale: ptBR,
  });

  const handleGeneratePdf = useCallback(async () => {
    if (!docRef.current) return;
    setGenerating(true);
    setEditing(false);
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: 'contrato-' + contract.id + '.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(docRef.current)
        .save();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setGenerating(false);
    }
  }, [contract.id]);

  const model: ContractDocumentModel = {
    contract,
    editing,
    generating,
    setEditing,
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
    contractCity,
    setContractCity,
    today,
    createdDate,
  };

  return (
    <DocumentViewer
      label="Contrato"
      toolbar={<ContractDocumentToolbar model={model} onGeneratePdf={handleGeneratePdf} onClose={onClose} />}
      onClose={onClose}
    >
      <>
        <div className={styles.paper}>
          <div className={styles.paperInner} ref={docRef}>
            <ContractDocumentHeader model={model} />
            <ContractDocumentClauses model={model} />
            <ContractDocumentSignatures model={model} />
            <ContractDocumentMenu model={model} />
          </div>
        </div>
      </>
    </DocumentViewer>
  );
}
