import { Badge } from '../../../../../../packages/ui/src/index';
import type { SuppliesController } from '../hooks/use-supplies-controller';
import { isExpiringSoon, statusConfig } from '../types/supply-types';
import styles from '../styles/EstoqueInsumos.module.scss';

export default function SupplyDetailsModal({ controller }: { controller: SuppliesController }) {
  const { viewingItem, setViewingItem, openEdit } = controller;
  if (!viewingItem) return null;
  const status = statusConfig[viewingItem.status];
  return (
    <div className={styles.overlay} onClick={() => setViewingItem(null)}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{viewingItem.name}</h2>
          <button className={styles.modalClose} onClick={() => setViewingItem(null)}>
            ×
          </button>
        </div>
        <div className={styles.viewGrid}>
          <div>
            <span className={styles.viewLabel}>Status</span>
            <Badge variant={status.color}>{status.label}</Badge>
          </div>
          <div>
            <span className={styles.viewLabel}>Categoria</span>
            <span className={styles.viewValue}>{viewingItem.category || '—'}</span>
          </div>
          <div>
            <span className={styles.viewLabel}>Quantidade</span>
            <span className={styles.viewValue}>
              {viewingItem.quantity} {viewingItem.measureUnit}
            </span>
          </div>
          <div>
            <span className={styles.viewLabel}>Mínimo</span>
            <span className={styles.viewValue}>
              {viewingItem.minStock} {viewingItem.measureUnit}
            </span>
          </div>
          <div>
            <span className={styles.viewLabel}>Custo unitário</span>
            <span className={styles.viewValue}>R$ {viewingItem.costPerUnit.toFixed(2)}</span>
          </div>
          <div>
            <span className={styles.viewLabel}>Valor total</span>
            <span className={styles.viewValue}>R$ {(viewingItem.quantity * viewingItem.costPerUnit).toFixed(2)}</span>
          </div>
          <div>
            <span className={styles.viewLabel}>Fornecedor</span>
            <span className={styles.viewValue}>{viewingItem.supplier || '—'}</span>
          </div>
          <div>
            <span className={styles.viewLabel}>Validade</span>
            <span className={styles.viewValue}>
              {viewingItem.expirationDate ? new Date(viewingItem.expirationDate).toLocaleDateString('pt-BR') : '—'}
              {isExpiringSoon(viewingItem.expirationDate) ? ' · vencendo em breve' : ''}
            </span>
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnCancel} onClick={() => setViewingItem(null)}>
            Fechar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setViewingItem(null);
              openEdit(viewingItem);
            }}
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
