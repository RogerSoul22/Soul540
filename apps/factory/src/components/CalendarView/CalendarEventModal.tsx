import { useState, type MouseEvent } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PizzaEvent } from '@soul540/contracts';
import styles from './styles/CalendarView.module.scss';
import { buildEventWhatsAppUrl as buildSharedEventWhatsAppUrl } from '@soul540/domain';
import { FactoryCalendarEventDelete } from './FactoryCalendarEventDelete';
import { FactoryCalendarEventEdit } from './FactoryCalendarEventEdit';
import { FactoryCalendarEventView } from './FactoryCalendarEventView';
import { IconX } from './CalendarEventIcons';
import { getEventColor } from './calendar-utils';

type Props = {
  event: PizzaEvent;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<PizzaEvent>) => void;
  onDelete: (id: string) => void;
};

export default function CalendarEventModal({ event, onClose, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [form, setForm] = useState<Partial<PizzaEvent>>({ ...event });
  const color = getEventColor(event);

  const buildWhatsAppUrl = () =>
    buildSharedEventWhatsAppUrl({
      phone: event.phone,
      name: event.name,
      dateLabel: format(parseISO(event.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      time: event.time,
      location: event.location,
      outOfCity: event.outOfCity,
      guestCount: event.guestCount,
      budget: event.budget,
      notes: event.notes,
    });
  const handleSave = () => {
    onUpdate(event.id, form);
    onClose();
  };
  const handleDelete = () => {
    onDelete(event.id);
    onClose();
  };
  const handleOverlayClick = (mouseEvent: MouseEvent) => {
    if (mouseEvent.target === mouseEvent.currentTarget) onClose();
  };

  return (
    <div className={styles.eventOverlay} onClick={handleOverlayClick}>
      <div className={styles.eventPanel}>
        <div className={styles.panelHeader} style={{ borderLeftColor: color.solid }}>
          <div className={styles.panelHeaderLeft}>
            {mode === 'view' && <p className={styles.panelTitle}>{event.name}</p>}
            {mode === 'edit' && <p className={styles.panelTitle}>Editar evento</p>}
            {mode === 'delete' && <p className={styles.panelTitle}>Excluir evento</p>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <IconX />
          </button>
        </div>
        {mode === 'view' && <FactoryCalendarEventView event={event} onClose={onClose} />}
        {mode === 'edit' && (
          <FactoryCalendarEventEdit
            form={form}
            setForm={setForm}
            onCancel={() => setMode('view')}
            onSave={handleSave}
          />
        )}
        {mode === 'delete' && (
          <FactoryCalendarEventDelete event={event} onCancel={() => setMode('view')} onConfirm={handleDelete} />
        )}
      </div>
    </div>
  );
}
