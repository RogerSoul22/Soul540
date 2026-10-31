import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceXmlItemsList from './FinanceXmlItemsList';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceXmlImportModal({ controller }: { controller: FinanceiroController }) {
  const { showXmlModal, setShowXmlModal, xmlSupplier, xmlDate, xmlItems, xmlImporting, handleXmlImport } = controller;
  if (!showXmlModal) return null;
  const selectedCount = xmlItems.filter((item) => item.selected).length;
  return (
    <div className={styles.overlay} onClick={() => setShowXmlModal(false)}>
      <div className={styles.xmlModal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Importar NF-e XML</h2>
            {xmlSupplier && (
              <p className={styles.xmlSupplier}>
                Fornecedor: <strong>{xmlSupplier}</strong>
              </p>
            )}
            {xmlDate && (
              <p className={styles.xmlSupplier}>
                Data: <strong>{new Date(xmlDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
              </p>
            )}
          </div>
          <button className={styles.modalClose} onClick={() => setShowXmlModal(false)} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
          <FinanceXmlItemsList controller={controller} />
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={() => setShowXmlModal(false)}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleXmlImport}
            disabled={xmlImporting || selectedCount === 0}
          >
            {xmlImporting ? 'Importando...' : 'Importar ' + selectedCount + (selectedCount === 1 ? ' item' : ' itens')}
          </button>
        </div>
      </div>
    </div>
  );
}
