import { useMemo, useState } from 'react';
import { addDays, addMonths, isToday, subDays, subMonths } from 'date-fns';
import type { PizzaEvent } from '@soul540/contracts';
import { useApp } from '../../contexts/AppContext';
import CalendarEventModal from './CalendarEventModal';
import CalendarDayView from './CalendarDayView';
import CalendarMonthView from './CalendarMonthView';
import { getCalendarDays, getEventsForDay } from './calendar-utils';

type Props = { events: PizzaEvent[]; month?: Date; onMonthChange?: (month: Date) => void };
type ViewMode = 'month' | 'day';

export default function CalendarView({ events, month: controlledMonth, onMonthChange }: Props) {
  const { updateEvent, deleteEvent } = useApp();
  const [view, setView] = useState<ViewMode>('month');
  const [internalMonth, setInternalMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<PizzaEvent | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const currentMonth = controlledMonth ?? internalMonth;
  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const dayEvents = useMemo(() => getEventsForDay(events, selectedDay), [events, selectedDay]);
  const setCurrentMonth = (next: Date | ((previous: Date) => Date)) => {
    const month = typeof next === 'function' ? next(currentMonth) : next;
    setInternalMonth(month);
    onMonthChange?.(month);
  };
  const openEvent = (event: PizzaEvent, mouseEvent: React.MouseEvent) => {
    mouseEvent.stopPropagation();
    setSelectedEvent(event);
  };
  const goToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDay(today);
  };
  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setShowPicker(true);
  };
  const selectPickerMonth = (month: number) => {
    setCurrentMonth(new Date(pickerYear, month, 1));
    setShowPicker(false);
  };
  return view === 'month' ? (
    <>
      <CalendarMonthView
        currentMonth={currentMonth}
        selectedDay={selectedDay}
        pickerYear={pickerYear}
        showPicker={showPicker}
        days={days}
        eventsForDay={(day) => getEventsForDay(events, day)}
        onOpenPicker={openPicker}
        onClosePicker={() => setShowPicker(false)}
        onPickerYearChange={setPickerYear}
        onSelectPickerMonth={selectPickerMonth}
        onToday={goToday}
        onPreviousMonth={() => setCurrentMonth((date) => subMonths(date, 1))}
        onNextMonth={() => setCurrentMonth((date) => addMonths(date, 1))}
        onOpenDay={(day) => {
          setSelectedDay(day);
          setView('day');
        }}
        onOpenEvent={openEvent}
      />
      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
        />
      )}
    </>
  ) : (
    <>
      <CalendarDayView
        selectedDay={selectedDay}
        dayEvents={dayEvents}
        onBack={() => setView('month')}
        onPrevious={() => setSelectedDay((day) => subDays(day, 1))}
        onNext={() => setSelectedDay((day) => addDays(day, 1))}
        onOpenEvent={openEvent}
      />
      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
        />
      )}
    </>
  );
}
