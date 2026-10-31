import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { whatsappIconPath } from '../support/event-icons';
import styles from '../styles/Eventos.module.scss';

type Props = {
  event: PizzaEvent;
  whatsappUrl: string;
  onEdit: (event: PizzaEvent) => void;
  onDelete: (id: string) => void;
  onFinalize: (id: string) => void;
  readOnly?: boolean;
};

export default function EventCardActions({ event, whatsappUrl, onEdit, onDelete, onFinalize, readOnly }: Props) {
  return (
    <div className={styles.cardActions}>
      {event.phone && (
        <a
          className={styles.btnWhatsapp}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(click) => click.stopPropagation()}
          title="WhatsApp"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d={whatsappIconPath} />
          </svg>
        </a>
      )}
      {!readOnly && event.status !== 'completed' && event.status !== 'cancelled' && (
        <button
          className={styles.btnFinalize}
          onClick={(click) => {
            click.stopPropagation();
            onFinalize(event.id);
          }}
        >
          Finalizar
        </button>
      )}
      {!readOnly && (
        <button
          className={styles.btnEdit}
          onClick={(click) => {
            click.stopPropagation();
            onEdit(event);
          }}
        >
          Editar
        </button>
      )}
      {!readOnly && (
        <button
          className={styles.btnDelete}
          onClick={(click) => {
            click.stopPropagation();
            onDelete(event.id);
          }}
        >
          Excluir
        </button>
      )}
    </div>
  );
}
