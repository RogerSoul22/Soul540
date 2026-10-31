import { Badge } from '../../../../ui/src/index';
import InventoryModalFrame from './InventoryModalFrame';
import frameStyles from './styles/InventoryModalFrame.module.scss';
import type { Utensil } from './utensil-types';
import { utensilStatusConfig } from './utensil-types';
import styles from './styles/UtensilDetailsModal.module.scss';

interface UtensilDetailsModalProps {
  item: Utensil | null;
  onClose: () => void;
  onEdit: (utensil: Utensil) => void;
}

export default function UtensilDetailsModal({ item, onClose, onEdit }: UtensilDetailsModalProps) {
  if (!item) return null;

  const status = utensilStatusConfig[item.status];

  return (
    <InventoryModalFrame
      footer={
        <>
          <button className={frameStyles.cancelButton} onClick={onClose}>
            Fechar
          </button>
          <button
            className={frameStyles.primaryButton}
            onClick={() => {
              onClose();
              onEdit(item);
            }}
          >
            Editar
          </button>
        </>
      }
      onClose={onClose}
      title={item.name}
    >
      <div className={styles.grid}>
        <Detail label="Status">
          <Badge variant={status.color}>{status.label}</Badge>
        </Detail>
        <Detail label="Categoria" value={item.category || '—'} />
        <Detail label="Quantidade" value={`${item.quantity} un`} />
        <Detail label="Valor unitário" value={formatValue(item.unitValue)} />
        <Detail
          label="Valor total"
          value={item.unitValue != null ? formatValue(item.unitValue * item.quantity) : '—'}
        />
        <Detail label="Localização" value={item.location || '—'} />
        <Detail label="Cadastrado em" value={new Date(item.createdAt).toLocaleDateString('pt-BR')} />
      </div>
    </InventoryModalFrame>
  );
}

function Detail({ children, label, value }: { children?: React.ReactNode; label: string; value?: string }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children ?? <span className={styles.value}>{value}</span>}
    </div>
  );
}

function formatValue(value?: number) {
  return value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—';
}
