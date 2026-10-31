import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getModalityLabel, getUpcomingFeirinhaOccurrences } from '../support/event-modalities';
import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import type { PizzaEvent } from '../../../types/Event';
import styles from '../styles/Eventos.module.scss';

type Props = {
  event: PizzaEvent;
  onConfirm: (templateId: string, date: string) => Promise<void>;
};

export default function RecurringFeirinhaCard({ event, onConfirm }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const occurrences = getUpcomingFeirinhaOccurrences(event, today, 8);
  return (
    <div className={styles.recurringCard}>
      <div className={styles.recurringHeader}>
        <div>
          <span className={styles.modalityBadge}>{getModalityLabel(event.modality)}</span>
          <h3 className={styles.cardTitle}>{event.name}</h3>
          <p className={styles.cardSub}>Programação semanal · {event.location}</p>
        </div>
      </div>
      <div className={styles.recurringOccurrences}>
        {occurrences.map((date) => (
          <div key={date} className={styles.recurringOccurrence}>
            <span>{format(new Date(`${date}T12:00:00`), "dd 'de' MMMM", { locale: ptBR })}</span>
            <button
              className={styles.recurringConfirm}
              onClick={async () => {
                try {
                  await onConfirm(event.id, date);
                } catch (error) {
                  notifyFeedback(error instanceof Error ? error.message : 'Não foi possível confirmar a ocorrência.');
                }
              }}
            >
              Confirmar ocorrência
            </button>
          </div>
        ))}
        {occurrences.length === 0 && <span className={styles.sectionEmpty}>Nenhuma ocorrência futura.</span>}
      </div>
    </div>
  );
}
