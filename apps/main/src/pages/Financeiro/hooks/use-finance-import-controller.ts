import { useRef, useState } from 'react';
import { notifyFeedback } from '@soul540/api-client';
import { useFinanceXmlImport } from './use-finance-xml-import';
import { apiFetch } from '../../../lib/api';
import type { useApp } from '../../../contexts/AppContext';
import type { FinanceOfxItem as OfxFinanceItem } from '../support/finance-importers';
type FinanceImportControllerDependencies = Pick<ReturnType<typeof useApp>, 'addFinance' | 'refreshFinances'>;
export function useFinanceImportController({ addFinance, refreshFinances }: FinanceImportControllerDependencies) {
  const xml = useFinanceXmlImport(addFinance);
  // OFX bank statement import state
  const [showOfxModal, setShowOfxModal] = useState(false);
  const [ofxItems, setOfxItems] = useState<OfxFinanceItem[]>([]);
  const [ofxBankAccount, setOfxBankAccount] = useState('');
  const [ofxStatementBalance, setOfxStatementBalance] = useState<number | undefined>();
  const [ofxText, setOfxText] = useState('');
  const [ofxPreviewing, setOfxPreviewing] = useState(false);
  const [ofxImporting, setOfxImporting] = useState(false);
  const ofxInputRef = useRef<HTMLInputElement>(null);
  const handleOfxFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const bytes = ev.target?.result as ArrayBuffer;
        const utf8 = new TextDecoder('utf-8').decode(bytes);
        const text = utf8.includes('\uFFFD') ? new TextDecoder('windows-1252').decode(bytes) : utf8;
        setOfxPreviewing(true);
        const response = await apiFetch('/api/finances/ofx/preview', {
          method: 'POST',
          headers: { 'X-System': 'main' },
          body: JSON.stringify({ ofxText: text }),
        });
        const preview = await response.json();
        if (!response.ok) throw new Error(preview.error || 'OFX preview failed');
        setOfxText(text);
        setOfxBankAccount(preview.bankAccount);
        setOfxStatementBalance(preview.statementBalance);
        setOfxItems(
          preview.suggestions.map((item: Omit<OfxFinanceItem, 'id' | 'category' | 'selected'>, index: number) => ({
            ...item,
            id: String(index),
            category: '',
            selected: item.decision === 'link' || item.decision === 'create_unclassified',
          })),
        );
        setShowOfxModal(true);
      } catch (error) {
        notifyFeedback(error instanceof Error ? error.message : 'Não foi possível ler o arquivo OFX.');
      } finally {
        setOfxPreviewing(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };
  const handleOfxImport = async () => {
    const selected = ofxItems.filter(
      (item) => item.selected && item.decision !== 'duplicate' && item.decision !== 'ambiguous',
    );
    if (!selected.length || !ofxText) return;
    setOfxImporting(true);
    try {
      const response = await apiFetch('/api/finances/ofx/import', {
        method: 'POST',
        headers: { 'X-System': 'main' },
        body: JSON.stringify({
          ofxText,
          selections: selected.map((item) => ({
            externalId: item.externalId,
            ...(item.decision === 'create_unclassified' && item.category ? { category: item.category } : {}),
            ...(item.financeId ? { financeId: item.financeId } : {}),
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'OFX import failed');
      refreshFinances();
      setShowOfxModal(false);
      setOfxItems([]);
      setOfxText('');
    } catch (error) {
      notifyFeedback(error instanceof Error ? error.message : 'Falha ao importar o extrato OFX.');
    } finally {
      setOfxImporting(false);
    }
  };
  return {
    ...xml,
    showOfxModal,
    setShowOfxModal,
    ofxItems,
    setOfxItems,
    ofxBankAccount,
    setOfxBankAccount,
    ofxStatementBalance,
    setOfxStatementBalance,
    ofxText,
    setOfxText,
    ofxPreviewing,
    setOfxPreviewing,
    ofxImporting,
    setOfxImporting,
    ofxInputRef,
    handleOfxFile,
    handleOfxImport,
  };
}
