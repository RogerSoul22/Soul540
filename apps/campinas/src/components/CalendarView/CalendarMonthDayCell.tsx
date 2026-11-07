import { format, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns';
import type { MouseEvent } from 'react';
import type { PizzaEvent } from '../../types/Event';
import styles from './styles/CalendarView.module.scss';
import { getEventColor, isEventStart } from './calendar-utils';

type Props = {
  day: Date;
  currentMonth: Date;
  selectedDay: Date;
  events: PizzaEvent[];
  onOpenDay: (day: Date) => void;
  onOpenEvent: (event: PizzaEvent, eventMouse: MouseEvent) => void;
};

export default function CalendarMonthDayCell({
  day,
  currentMonth,
  selectedDay,
  events,
  onOpenDay,
  onOpenEvent,
}: Props) {
  const inMonth = isSameMonth(day, currentMonth);
  return (
    <div
      className={[
        styles.cell,
        !inMonth ? styles.cellOtherMonth : '',
        isSameDay(day, selectedDay) ? styles.cellSelected : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onOpenDay(day)}
    >
      <span className={[styles.dayNum, isToday(day) ? styles.dayToday : ''].filter(Boolean).join(' ')}>
        {format(day, 'd')}
      </span>
      <div className={styles.pills}>
        {events.slice(0, 3).map((event) => {
          const color = getEventColor(event);
          const start = isEventStart(event, day);
          const end = !event.endDate || isSameDay(parseISO(event.endDate), day);
          const multi = Boolean(event.endDate && !isSameDay(parseISO(event.date), parseISO(event.endDate)));
          const radius = !multi ? '4px' : start && end ? '4px' : start ? '4px 0 0 4px' : end ? '0 4px 4px 0' : '0';
          return (
            <div
              key={event.id}
              className={[styles.pill, event.notes?.trim() ? styles.pillNotes : ''].filter(Boolean).join(' ')}
              style={{
                background: color.bg,
                color: color.text,
                borderColor: color.border,
                borderRadius: radius,
                ...(multi && !start ? { marginLeft: -6, paddingLeft: 4 } : {}),
                ...(multi && !end ? { marginRight: -6, paddingRight: 4 } : {}),
              }}
              title={event.name}
              onClick={(mouseEvent) => onOpenEvent(event, mouseEvent)}
            >
              {start ? event.name : '\u00A0'}
            </div>
          );
        })}
        {events.length > 3 && <div className={styles.pillMore}>+{events.length - 3}</div>}
      </div>
    </div>
  );
}
