import { Button, Card, Heading } from '../../../../../../packages/pentagono/src/index';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { getModalityLabel, getUpcomingFeirinhaOccurrences } from '../support/event-modalities';
import { notifyFeedback } from '../../../../../../packages/api-client/src/index';
import type { PizzaEvent } from '../../../types/Event';
import styles from '../styles/Eventos.module.scss';

type Props = {
  event: PizzaEvent;
  existingOccurrences: PizzaEvent[];
  onConfirm: (templateId: string, date: string) => Promise<void>;
};

export default function RecurringFeirinhaCard({ event, existingOccurrences, onConfirm }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const occurrences = getUpcomingFeirinhaOccurrences(event, today, 8);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const occurrenceByDate = new Map(existingOccurrences.map((occurrence) => [occurrence.date, occurrence]));

  return (
    <Card className={styles.recurringCard}>
      <div className={styles.recurringHeader}>
        <div>
          <span className={styles.modalityBadge}>{getModalityLabel(event.modality)}</span>
          <Heading level={3} variant="section" className={styles.cardTitle}>
            {event.name}
          </Heading>
          <p className={styles.cardSub}>Programação semanal · {event.location}</p>
        </div>
      </div>
      <div className={styles.recurringOccurrences}>
        {occurrences.map((date) => (
          <div key={date} className={styles.recurringOccurrence}>
            <span>{format(new Date(`${date}T12:00:00`), "dd 'de' MMMM", { locale: ptBR })}</span>
            {occurrenceByDate.has(date) ? (
              <span className={styles.sectionEmpty}>
                {occurrenceByDate.get(date)?.status === 'cancelled' ? 'Cancelada' : 'Já confirmada'}
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className={styles.recurringConfirm}
                disabled={pendingDate === date}
                onClick={async () => {
                  setPendingDate(date);
                  try {
                    await onConfirm(event.id, date);
                  } catch (error) {
                    notifyFeedback(error instanceof Error ? error.message : 'Não foi possível confirmar a ocorrência.');
                  } finally {
                    setPendingDate(null);
                  }
                }}
              >
                {pendingDate === date ? 'Confirmando...' : 'Confirmar ocorrência'}
              </Button>
            )}
          </div>
        ))}
        {occurrences.length === 0 && <span className={styles.sectionEmpty}>Nenhuma ocorrência futura.</span>}
      </div>
    </Card>
  );
}
