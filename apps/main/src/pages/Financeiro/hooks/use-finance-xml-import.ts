import { useRef, useState } from 'react';
import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import type { useApp } from '../../../contexts/AppContext';
import { parseNFeXmlForFinance, type FinanceXmlItem as XmlFinanceItem } from '../support/finance-importers';

export function useFinanceXmlImport(addFinance: ReturnType<typeof useApp>['addFinance']) {
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [xmlItems, setXmlItems] = useState<XmlFinanceItem[]>([]);
  const [xmlSupplier, setXmlSupplier] = useState('');
  const [xmlDate, setXmlDate] = useState('');
  const [xmlImporting, setXmlImporting] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const handleXmlFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const { supplier, date, items } = parseNFeXmlForFinance(loadEvent.target?.result as string);
        setXmlSupplier(supplier);
        setXmlDate(date);
        setXmlItems(items.map((item, index) => ({ ...item, id: String(index), category: '', selected: true })));
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
    try {
      for (const item of selected)
        await addFinance({
          type: 'cost',
          category: item.category || 'outro',
          description: item.name + (xmlSupplier ? ` - ${xmlSupplier}` : ''),
          amount: item.totalValue,
          date: xmlDate,
          status: 'pending',
          eventId: '',
        });
    } finally {
      setXmlImporting(false);
      setShowXmlModal(false);
      setXmlItems([]);
    }
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
