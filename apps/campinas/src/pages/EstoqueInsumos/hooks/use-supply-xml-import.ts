import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { apiFetch } from '../../../lib/api';
import { calcStatus, parseNFeXml, type Supply, type XmlImportItem } from '../types/supply-types';

export function useSupplyXmlImport(setSupplies: Dispatch<SetStateAction<Supply[]>>) {
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [xmlItems, setXmlItems] = useState<XmlImportItem[]>([]);
  const [xmlSupplier, setXmlSupplier] = useState('');
  const [xmlImporting, setXmlImporting] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const handleXmlFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = parseNFeXml(String(loadEvent.target?.result || ''));
        setXmlSupplier(parsed.supplier);
        setXmlItems(
          parsed.items.map((item, index) => ({
            ...item,
            id: String(index),
            category: '',
            selected: true,
          })),
        );
        setShowXmlModal(true);
      } catch {
        notifyFeedback('Não foi possível ler o XML. Verifique se é uma NF-e válida.');
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    event.target.value = '';
  };

  const importXml = async () => {
    const selected = xmlItems.filter((item) => item.selected);
    if (!selected.length) return;
    setXmlImporting(true);
    for (const item of selected) {
      const data = {
        name: item.name,
        category: item.category,
        measureUnit: item.measureUnit,
        quantity: item.quantity,
        minStock: 0,
        costPerUnit: item.costPerUnit,
        supplier: item.supplier,
        expirationDate: item.expirationDate || undefined,
        status: calcStatus(item.quantity, 0, item.expirationDate || undefined),
      };
      const response = await apiFetch('/api/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const created: Supply = await response.json();
      setSupplies((current) => [...current, created]);
    }
    setXmlImporting(false);
    setXmlItems([]);
    setShowXmlModal(false);
  };

  return {
    showXmlModal,
    setShowXmlModal,
    xmlItems,
    setXmlItems,
    xmlSupplier,
    xmlImporting,
    xmlInputRef,
    handleXmlFile,
    importXml,
  };
}
