import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceXmlItemsList from './FinanceXmlItemsList';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceXmlImportModal({ controller }: { controller: FinanceiroController }) {
  const { showXmlModal, setShowXmlModal, xmlSupplier, xmlDate, xmlItems, xmlImporting, handleXmlImport } = controller;
  if (!showXmlModal) return null;
  const selectedCount = xmlItems.filter((item) => item.selected).length;
  return (
    <Modal
      title="Importar NF-e XML"
      onClose={() => setShowXmlModal(false)}
      closeOnOverlay
      maxWidth={700}
      className={styles.xmlModal}
      subtitle={
        <>
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
        </>
      }
      flush
    >
      <div className={styles.modalBody} style={{ padding: '16px 24px', gap: 12 }}>
        <FinanceXmlItemsList controller={controller} />
      </div>
      <div className={styles.modalFooter}>
        <Button variant="ghost" onClick={() => setShowXmlModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleXmlImport} disabled={xmlImporting || selectedCount === 0}>
          {xmlImporting ? 'Importando...' : 'Importar ' + selectedCount + (selectedCount === 1 ? ' item' : ' itens')}
        </Button>
      </div>
    </Modal>
  );
}
