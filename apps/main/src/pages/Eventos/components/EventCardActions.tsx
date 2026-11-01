import { Button } from '../../../../../../packages/pentagono/src/index';
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
        <Button
          variant="primary"
          size="sm"
          className={styles.btnFinalize}
          onClick={(click) => {
            click.stopPropagation();
            onFinalize(event.id);
          }}
        >
          Finalizar
        </Button>
      )}
      {!readOnly && (
        <Button
          variant="secondary"
          size="sm"
          onClick={(click) => {
            click.stopPropagation();
            onEdit(event);
          }}
        >
          Editar
        </Button>
      )}
      {!readOnly && (
        <Button
          variant="danger"
          onClick={(click) => {
            click.stopPropagation();
            onDelete(event.id);
          }}
        >
          Excluir
        </Button>
      )}
    </div>
  );
}
