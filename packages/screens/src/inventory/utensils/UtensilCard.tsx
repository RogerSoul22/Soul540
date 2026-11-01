import { Badge, Button } from '../../../../pentagono/src/index';
import type { Utensil } from './utensil-types';
import { utensilStatusConfig } from './utensil-types';
import styles from './styles/UtensilsInventoryList.module.scss';

type Props = {
  onDelete: (id: string) => void;
  onEdit: (utensil: Utensil) => void;
  onView: (utensil: Utensil) => void;
  utensil: Utensil;
};

export default function UtensilCard({ utensil, onDelete, onEdit, onView }: Props) {
  const status = utensilStatusConfig[utensil.status];
  return (
    <article className={styles.card} onClick={() => onView(utensil)}>
      <div className={styles.cardTop}>
        <div className={styles.cardIcon}>
          <ToolIcon />
        </div>
        <div className={styles.cardInfo}>
          <p className={styles.cardName}>{utensil.name}</p>
          <p className={styles.cardCategory}>{utensil.category}</p>
        </div>
        <Badge variant={status.color}>{status.label}</Badge>
      </div>
      <div className={styles.cardDetails}>
        <Detail label="Qtd:" value={`${utensil.quantity} un`} />
        {utensil.unitValue != null && (
          <Detail
            label="Valor:"
            value={`R$ ${(utensil.unitValue * utensil.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
        )}
        {utensil.location && <Detail label="Local:" value={utensil.location} />}
      </div>
      <div className={styles.cardActions}>
        <Button
          type="button"
          variant="secondary"
          className={styles.editButton}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(utensil);
          }}
        >
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={styles.deleteButton}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(utensil.id);
          }}
        >
          Excluir
        </Button>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailKey}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ToolIcon() {
  const path =
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94' +
    'l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={path} />
    </svg>
  );
}
