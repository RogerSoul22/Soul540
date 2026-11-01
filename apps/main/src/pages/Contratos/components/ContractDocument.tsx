import { DocumentViewer } from '../../../../../../packages/pentagono/src/index';
import { useCallback, useRef } from 'react';
import styles from '../styles/ContractDocument.module.scss';
import { ContractDocumentClauses } from './ContractDocumentClauses';
import { ContractDocumentHeader } from './ContractDocumentHeader';
import { ContractDocumentMenu } from './ContractDocumentMenu';
import { ContractDocumentSignatures } from './ContractDocumentSignatures';
import { ContractDocumentToolbar } from './ContractDocumentToolbar';
import { useContractDocumentMenu } from '../hooks/use-contract-document-menu';
import { useContractDocumentModel } from '../hooks/use-contract-document-model';
import type { ContractDocumentModel, ContractDocumentProps } from '../types/contract-document-types';

export type { Contract } from '../types/contract-document-types';

export default function ContractDocument({ contract, event, onClose }: ContractDocumentProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const baseModel = useContractDocumentModel({ contract, event });
  const menuModel = useContractDocumentMenu(contract);
  const model: ContractDocumentModel = { ...baseModel, ...menuModel };

  const handleGeneratePdf = useCallback(async () => {
    if (!docRef.current) return;
    model.setGenerating(true);
    model.setEditing(false);
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
      model.setGenerating(false);
    }
  }, [contract.id, model]);

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
