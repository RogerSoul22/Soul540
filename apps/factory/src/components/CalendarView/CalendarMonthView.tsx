import { Backdrop, Button } from '../../../../../packages/pentagono/src/index';
import { format, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MouseEvent } from 'react';
import type { PizzaEvent } from '../../../../../packages/contracts/src/index';
import styles from './styles/CalendarView.module.scss';
import { IconChevronDown, IconChevronLeft, IconChevronRight } from './CalendarIcons';
import { getEventColor, isEventStart, MONTHS_PT, WEEK_DAYS } from './calendar-utils';
import CalendarMonthDayCell from './CalendarMonthDayCell';

type Props = {
  currentMonth: Date;
  selectedDay: Date;
  pickerYear: number;
  showPicker: boolean;
  days: Date[];
  eventsForDay: (day: Date) => PizzaEvent[];
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onPickerYearChange: (year: number) => void;
  onSelectPickerMonth: (month: number) => void;
  onToday: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onOpenDay: (day: Date) => void;
  onOpenEvent: (event: PizzaEvent, mouseEvent: MouseEvent) => void;
};

export default function CalendarMonthView({
  currentMonth,
  selectedDay,
  pickerYear,
  showPicker,
  days,
  eventsForDay,
  onOpenPicker,
  onClosePicker,
  onPickerYearChange,
  onSelectPickerMonth,
  onToday,
  onPreviousMonth,
  onNextMonth,
  onOpenDay,
  onOpenEvent,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.monthTitleWrap}>
          <Button
            variant="ghost"
            size="sm"
            className={styles.monthTitleBtn}
            onClick={onOpenPicker}
            title="Ir para um mês específico"
          >
            <span className={styles.monthTitleText}>{format(currentMonth, 'MMMM', { locale: ptBR })}</span>
            <span className={styles.monthYear}>{format(currentMonth, ' yyyy')}</span>
            <span className={styles.monthTitleChevron}>
              <IconChevronDown />
            </span>
          </Button>
          {showPicker && (
            <>
              <Backdrop className={styles.pickerOverlay} onClick={onClosePicker} />
              <div className={styles.picker}>
                <div className={styles.pickerYearRow}>
                  <Button
                    variant="chip"
                    className={styles.pickerYearBtn}
                    onClick={() => onPickerYearChange(pickerYear - 1)}
                    aria-label="Ano anterior"
                  >
                    <IconChevronLeft />
                  </Button>
                  <span className={styles.pickerYearLabel}>{pickerYear}</span>
                  <Button
                    variant="chip"
                    className={styles.pickerYearBtn}
                    onClick={() => onPickerYearChange(pickerYear + 1)}
                    aria-label="Próximo ano"
                  >
                    <IconChevronRight />
                  </Button>
                </div>
                <div className={styles.pickerMonths}>
                  {MONTHS_PT.map((name, index) => (
                    <Button
                      variant="chip"
                      key={name}
                      className={[
                        styles.pickerMonth,
                        pickerYear === currentMonth.getFullYear() && index === currentMonth.getMonth()
                          ? styles.pickerMonthActive
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => onSelectPickerMonth(index)}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className={styles.headerRight}>
          <Button variant="chip" className={styles.todayBtn} onClick={onToday}>
            Hoje
          </Button>
          <div className={styles.navBtns}>
            <Button variant="outline" className={styles.navBtn} onClick={onPreviousMonth} aria-label="Mês anterior">
              <IconChevronLeft />
            </Button>
            <Button variant="outline" className={styles.navBtn} onClick={onNextMonth} aria-label="Próximo mês">
              <IconChevronRight />
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.weekDays}>
        {WEEK_DAYS.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.grid}>
        {days.map((day) => (
          <CalendarMonthDayCell
            key={day.toISOString()}
            day={day}
            currentMonth={currentMonth}
            selectedDay={selectedDay}
            events={eventsForDay(day)}
            onOpenDay={onOpenDay}
            onOpenEvent={onOpenEvent}
          />
        ))}
      </div>
    </div>
  );
}
