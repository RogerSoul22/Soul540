import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceOfxItemsList from './FinanceOfxItemsList';
import styles from '../styles/Financeiro.module.scss';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';

export default function FinanceOfxImportModal({ controller }: { controller: FinanceiroController }) {
  const {
    showOfxModal,
    setShowOfxModal,
    ofxBankAccount,
    ofxStatementBalance,
    ofxItems,
    ofxPreviewing,
    ofxImporting,
    handleOfxImport,
  } = controller;
  if (!showOfxModal) return null;

  const selectedItems = ofxItems.filter(
    (item) => item.selected && item.decision !== 'duplicate' && item.decision !== 'ambiguous',
  );
  const duplicateCount = ofxItems.filter((item) => item.decision === 'duplicate').length;

  return (
    <div className={styles.overlay} onClick={() => setShowOfxModal(false)}>
      <div className={styles.xmlModal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Importar extrato OFX</h2>
            <p className={styles.xmlSupplier}>
              Conta: <strong>{ofxBankAccount || 'Não informada'}</strong>
            </p>
            {ofxStatementBalance !== undefined && Number.isFinite(ofxStatementBalance) && (
              <p className={styles.xmlSupplier}>
                Saldo informado pelo banco: <strong>{formatBRL(ofxStatementBalance)}</strong>
              </p>
            )}
          </div>
          <button className={styles.modalClose} onClick={() => setShowOfxModal(false)} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
          <FinanceOfxItemsList controller={controller} duplicateCount={duplicateCount} />
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={() => setShowOfxModal(false)}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleOfxImport}
            disabled={ofxPreviewing || ofxImporting || selectedItems.length === 0}
          >
            {ofxImporting
              ? 'Importando...'
              : 'Importar ' + selectedItems.length + (selectedItems.length === 1 ? ' movimento' : ' movimentos')}
          </button>
        </div>
      </div>
    </div>
  );
}
