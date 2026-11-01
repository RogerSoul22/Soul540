import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { Invoice } from '../../../../../../packages/contracts/src/index';
import styles from '../styles/NotasFiscais.module.scss';

type Props = {
  emitInvoice: Invoice | null;
  deleteId: string | null;
  onCloseEmit: () => void;
  onEmit: () => void;
  onCloseDelete: () => void;
  onDelete: () => void;
};

export default function InvoiceConfirmModals({
  emitInvoice,
  deleteId,
  onCloseEmit,
  onEmit,
  onCloseDelete,
  onDelete,
}: Props) {
  return (
    <>
      {emitInvoice && (
        <Modal title="Confirmar Emissão de Nota Fiscal" onClose={onCloseEmit}>
          <div className={styles.confirmModal}>
            <p className={styles.confirmText}>Confirma a emissão da nota fiscal?</p>
            <div className={styles.confirmDetails}>
              <p>
                Tipo: <strong>{(emitInvoice.type || 'nfse').toUpperCase()}</strong>
              </p>
              <p>
                Cliente: <strong>{emitInvoice.clientName}</strong>
              </p>
              <p>
                Total: <strong>R$ {emitInvoice.totalValue.toLocaleString('pt-BR')}</strong>
              </p>
            </div>
            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={onCloseEmit}>
                Cancelar
              </Button>
              <Button type="button" onClick={onEmit}>
                Emitir
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {deleteId && (
        <Modal title="Excluir Nota Fiscal" onClose={onCloseDelete}>
          <div className={styles.confirmModal}>
            <p className={styles.confirmText}>
              Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita.
            </p>
            <div className={styles.formActions}>
              <Button variant="secondary" type="button" onClick={onCloseDelete}>
                Cancelar
              </Button>
              <Button type="button" onClick={onDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
