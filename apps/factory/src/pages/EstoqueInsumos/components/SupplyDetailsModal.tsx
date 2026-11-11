import { Badge, Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { SuppliesController } from '../hooks/use-supplies-controller';
import { isExpiringSoon, statusConfig } from '../types/supply-types';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyDetailsModal({ controller }: { controller: SuppliesController }) {
  const { viewingItem, setViewingItem, openEdit } = controller;
  if (!viewingItem) return null;
  const status = statusConfig[viewingItem.status];
  return (
    <Modal title={viewingItem.name} onClose={() => setViewingItem(null)} closeOnOverlay maxWidth={520} flush>
      <div className={styles.viewGrid}>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Status</span>
          <Badge variant={status.color}>{status.label}</Badge>
        </div>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Categoria</span>
          <span className={styles.viewValue}>{viewingItem.category || '—'}</span>
        </div>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Quantidade</span>
          <span className={styles.viewValue}>
            {viewingItem.quantity} {viewingItem.measureUnit}
          </span>
        </div>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Mínimo</span>
          <span className={styles.viewValue}>
            {viewingItem.minStock} {viewingItem.measureUnit}
          </span>
        </div>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Custo unitário</span>
          <span className={styles.viewValue}>R$ {viewingItem.costPerUnit.toFixed(2)}</span>
        </div>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Valor total</span>
          <span className={styles.viewValue}>R$ {(viewingItem.quantity * viewingItem.costPerUnit).toFixed(2)}</span>
        </div>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Fornecedor</span>
          <span className={styles.viewValue}>{viewingItem.supplier || '—'}</span>
        </div>
        <div className={styles.viewItem}>
          <span className={styles.viewLabel}>Validade</span>
          <span className={styles.viewValue}>
            {viewingItem.expirationDate ? new Date(viewingItem.expirationDate).toLocaleDateString('pt-BR') : '—'}
            {isExpiringSoon(viewingItem.expirationDate) ? ' · vencendo em breve' : ''}
          </span>
        </div>
      </div>
      <div className={styles.formActions}>
        <Button variant="ghost" onClick={() => setViewingItem(null)}>
          Fechar
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setViewingItem(null);
            openEdit(viewingItem);
          }}
        >
          Editar
        </Button>
      </div>
    </Modal>
  );
}
