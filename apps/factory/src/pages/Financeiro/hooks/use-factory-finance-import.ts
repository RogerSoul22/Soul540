import { useRef, useState, type ChangeEvent } from 'react';
import { compareTextPtBr as compareAlpha } from '@soul540/domain';
import { notifyFeedback } from '@soul540/api-client';
import type { FinanceAppState, XmlFinanceItem } from '../types/finance-controller-types';
import { parseNFeXmlForFinance } from '../types/finance-controller-types';

type Props = Pick<FinanceAppState, 'addFinance'>;

export function useFactoryFinanceImport({ addFinance }: Props) {
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [xmlItems, setXmlItems] = useState<XmlFinanceItem[]>([]);
  const [xmlSupplier, setXmlSupplier] = useState('');
  const [xmlDate, setXmlDate] = useState('');
  const [xmlImporting, setXmlImporting] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const handleXmlFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = parseNFeXmlForFinance(loadEvent.target?.result as string);
        setXmlSupplier(parsed.supplier);
        setXmlDate(parsed.date);
        setXmlItems(
          parsed.items
            .map((item, index) => ({ ...item, id: String(index), category: '', selected: true }))
            .sort((left, right) => compareAlpha(left.name, right.name)),
        );
        setShowXmlModal(true);
      } catch {
        notifyFeedback('Não foi possível ler o XML. Verifique se é uma NF-e válida.');
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    event.target.value = '';
  };

  const handleXmlImport = async () => {
    const selected = xmlItems.filter((item) => item.selected);
    if (!selected.length) return;
    setXmlImporting(true);
    for (const item of selected) {
      await addFinance({
        type: 'cost',
        category: item.category || 'outros',
        description: `${item.name}${xmlSupplier ? ` — ${xmlSupplier}` : ''}`,
        amount: item.totalValue,
        date: xmlDate,
        status: 'pending',
        eventId: '',
      });
    }
    setXmlImporting(false);
    setShowXmlModal(false);
    setXmlItems([]);
  };

  return {
    showXmlModal,
    setShowXmlModal,
    xmlItems,
    setXmlItems,
    xmlSupplier,
    setXmlSupplier,
    xmlDate,
    setXmlDate,
    xmlImporting,
    setXmlImporting,
    xmlInputRef,
    handleXmlFile,
    handleXmlImport,
  };
}
