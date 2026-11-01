import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
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
    <Modal
      title="Importar extrato OFX"
      onClose={() => setShowOfxModal(false)}
      closeOnOverlay
      maxWidth={700}
      className={styles.xmlModal}
      subtitle={
        <>
          <p className={styles.xmlSupplier}>
            Conta: <strong>{ofxBankAccount || 'Não informada'}</strong>
          </p>
          {ofxStatementBalance !== undefined && Number.isFinite(ofxStatementBalance) && (
            <p className={styles.xmlSupplier}>
              Saldo informado pelo banco: <strong>{formatBRL(ofxStatementBalance)}</strong>
            </p>
          )}
        </>
      }
      flush
    >
      <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
        <FinanceOfxItemsList controller={controller} duplicateCount={duplicateCount} />
      </div>
      <div className={styles.modalFooter}>
        <Button variant="ghost" onClick={() => setShowOfxModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleOfxImport}
          disabled={ofxPreviewing || ofxImporting || selectedItems.length === 0}
        >
          {ofxImporting
            ? 'Importando...'
            : 'Importar ' + selectedItems.length + (selectedItems.length === 1 ? ' movimento' : ' movimentos')}
        </Button>
      </div>
    </Modal>
  );
}
