import { Button } from '../../../../../packages/pentagono/src/index';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MouseEvent } from 'react';
import type { PizzaEvent } from '../../types/Event';
import type { CalendarEvent } from './calendar-utils';
import styles from './styles/CalendarView.module.scss';
import { IconChevronLeft, IconChevronRight } from './CalendarIcons';
import { getEventColor, HOURS } from './calendar-utils';

type Props = {
  selectedDay: Date;
  dayEvents: CalendarEvent[];
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenEvent: (event: PizzaEvent, mouseEvent: MouseEvent) => void;
};

export default function CalendarDayView({ selectedDay, dayEvents, onBack, onPrevious, onNext, onOpenEvent }: Props) {
  const selectedToday = isToday(selectedDay);
  return (
    <div className={`${styles.wrapper} ${styles.wrapperDay}`}>
      <div className={styles.dayHeader}>
        <Button variant="outline" className={styles.backBtn} onClick={onBack}>
          <IconChevronLeft />
          <span>Voltar ao mês</span>
        </Button>
        <div className={styles.dayTitle}>
          <span className={styles.dayTitleWeekday}>{format(selectedDay, 'EEEE', { locale: ptBR })}</span>
          <span className={styles.dayTitleDate}>{format(selectedDay, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          {selectedToday && <span className={styles.todayChip}>Hoje</span>}
        </div>
        <div className={styles.dayNav}>
          <Button variant="outline" className={styles.navBtn} onClick={onPrevious} aria-label="Dia anterior">
            <IconChevronLeft />
          </Button>
          <Button variant="outline" className={styles.navBtn} onClick={onNext} aria-label="Próximo dia">
            <IconChevronRight />
          </Button>
        </div>
      </div>
      <div className={styles.allDayRow}>
        <div className={styles.allDayLabel}>dia todo</div>
        <div className={styles.allDayEvents}>
          {!dayEvents.length ? (
            <span className={styles.allDayEmpty}>Nenhum evento</span>
          ) : (
            dayEvents.map((event) => {
              const color = getEventColor(event);
              return (
                <div
                  key={event.id}
                  className={[
                    styles.allDayEvent,
                    event.isProjectedOccurrence ? styles.allDayEventProjected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    background: color.bg,
                    borderColor: color.solid,
                    color: color.text,
                  }}
                  onClick={event.isProjectedOccurrence ? undefined : (mouseEvent) => onOpenEvent(event, mouseEvent)}
                >
                  <div className={styles.allDayEventBar} style={{ background: color.solid }} />
                  <div className={styles.allDayEventContent}>
                    <p className={styles.allDayEventName}>
                      {event.name}
                      {event.isProjectedOccurrence ? ' · Programação semanal' : ''}
                    </p>
                    <p className={styles.allDayEventMeta}>
                      {event.location} · {event.guestCount} convidados · R$ {event.budget.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className={styles.timeGrid}>
        {HOURS.map((hour) => {
          const currentHour = selectedToday && new Date().getHours() === hour;
          return (
            <div key={hour} className={`${styles.hourRow} ${currentHour ? styles.hourRowNow : ''}`}>
              <div className={styles.hourLabel}>{String(hour).padStart(2, '0')}:00</div>
              <div className={styles.hourSlot}>
                {currentHour && (
                  <div className={styles.nowIndicator}>
                    <div className={styles.nowDot} />
                    <div className={styles.nowLine} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
