import { Button } from '../../../../../packages/pentagono/src/index';
import { notifyFeedback } from '../../../../../packages/api-client/src/index';
import { useState, type MouseEvent } from 'react';
import type { PizzaEvent } from '../../types/Event';
import styles from './styles/CalendarView.module.scss';
import CalendarEventDeletePanel from './CalendarEventDeletePanel';
import CalendarEventEditPanel from './CalendarEventEditPanel';
import CalendarEventViewPanel from './CalendarEventViewPanel';
import { getEventColor } from './calendar-utils';

type Props = {
  event: PizzaEvent;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<PizzaEvent>) => Promise<void>;
  onDelete: (id: string) => void;
};
type Mode = 'view' | 'edit' | 'delete';

function readNumber(value: string) {
  return value === '' ? undefined : Number(value);
}

function readList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CalendarEventModal({ event, onClose, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<Mode>('view');
  const [form, setForm] = useState<Partial<PizzaEvent>>({ ...event });
  const color = getEventColor(event);
  const updateForm = (data: Partial<PizzaEvent>) => setForm((current) => ({ ...current, ...data }));
  const save = async () => {
    try {
      await onUpdate(event.id, form);
      onClose();
    } catch (error) {
      notifyFeedback(error instanceof Error ? error.message : 'Falha ao atualizar evento');
    }
  };
  const remove = () => {
    onDelete(event.id);
    onClose();
  };
  const finalize = () => {
    void onUpdate(event.id, { status: 'completed' });
    onClose();
  };
  const overlayClick = (mouseEvent: MouseEvent) => {
    if (mouseEvent.target === mouseEvent.currentTarget) onClose();
  };
  return (
    <div className={styles.eventOverlay} onClick={overlayClick}>
      <div className={styles.eventPanel}>
        <div className={styles.panelHeader} style={{ borderLeftColor: color.solid }}>
          <div className={styles.panelHeaderLeft}>
            <p className={styles.panelTitle}>
              {mode === 'view' ? event.name : mode === 'edit' ? 'Editar evento' : 'Excluir evento'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            ×
          </Button>
        </div>
        {mode === 'view' && (
          <CalendarEventViewPanel
            event={event}
            onEdit={() => setMode('edit')}
            onDelete={() => setMode('delete')}
            onFinalize={finalize}
          />
        )}
        {mode === 'edit' && (
          <CalendarEventEditPanel
            form={form}
            updateForm={updateForm}
            readNumber={readNumber}
            readList={readList}
            onCancel={() => setMode('view')}
            onSave={save}
          />
        )}
        {mode === 'delete' && (
          <CalendarEventDeletePanel event={event} onCancel={() => setMode('view')} onConfirm={remove} />
        )}
      </div>
    </div>
  );
}
