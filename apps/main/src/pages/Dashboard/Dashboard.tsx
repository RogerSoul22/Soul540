import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarView from '../../components/CalendarView/CalendarView';
import { getUpcomingOperationalAlerts } from '../../../../../shared/events/eventInsights';
import {
  buildEmployeeSchedule,
  getEventFinancialClosing,
  getEventSupplyForecast,
} from '../../../../../shared/events/eventOperations';
import { apiFetch } from '../../lib/api';
import {
  formatDashboardEventDate as formatEventDate,
  getDashboardGreeting as getGreeting,
  parseDashboardEventDate as parseEventDate,
} from '../../../../../packages/screens/src/index';
import DashboardHeader from './components/DashboardHeader';
import DashboardCalendarHeader from './components/DashboardCalendarHeader';
import DashboardOperationalPanels from './components/DashboardOperationalPanels';
import DashboardInfoModal from './components/DashboardInfoModal';
import type { UnitFilter } from './types/dashboard-types';
import styles from './styles/Dashboard.module.scss';

export default function Dashboard() {
  const { events, tasks, finances } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [employees, setEmployees] = useState<Parameters<typeof buildEmployeeSchedule>[1]>([]);

  useEffect(() => {
    apiFetch('/api/employees', { headers: { 'X-System': 'main' } })
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setEmployees(data))
      .catch(() => {});
  }, []);

  const urgentTasks = useMemo(
    () => tasks.filter((task) => task.priority === 'urgent' && task.status !== 'done'),
    [tasks],
  );
  const filteredEvents = useMemo(() => {
    if (unitFilter === 'main') return events.filter((event) => !event.source || event.source === 'main');
    if (unitFilter === 'franchise') return events.filter((event) => event.source === 'franchise');
    return events;
  }, [events, unitFilter]);
  const monthEventCount = useMemo(
    () =>
      filteredEvents.filter((event) => {
        const date = parseEventDate(event.date);
        return date
          ? date.getMonth() === calendarMonth.getMonth() && date.getFullYear() === calendarMonth.getFullYear()
          : false;
      }).length,
    [filteredEvents, calendarMonth],
  );
  const operationalAlerts = useMemo(() => getUpcomingOperationalAlerts(filteredEvents, { limit: 4 }), [filteredEvents]);
  const teamSchedule = useMemo(
    () => buildEmployeeSchedule(filteredEvents, employees, { limit: 3 }).slice(0, 4),
    [filteredEvents, employees],
  );
  const financialClosings = useMemo(
    () =>
      filteredEvents
        .filter((event) => event.status === 'completed')
        .filter((event) => parseEventDate(event.date))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 3)
        .map((event) => ({ event, closing: getEventFinancialClosing(event, finances) })),
    [filteredEvents, finances],
  );
  const supplyForecasts = useMemo(
    () =>
      filteredEvents
        .filter((event) => event.status !== 'completed' && event.status !== 'cancelled')
        .filter((event) => parseEventDate(event.date))
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        .slice(0, 3)
        .map((event) => ({ event, forecast: getEventSupplyForecast(event) })),
    [filteredEvents],
  );
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const currentMonth = format(calendarMonth, 'MMMM', { locale: ptBR });

  return (
    <div className={styles.page}>
      <DashboardHeader
        today={today}
        greeting={getGreeting(user?.name)}
        urgentTaskCount={urgentTasks.length}
        onInfo={() => setShowInfo(true)}
      />
      <div className={styles.calendarSection}>
        <DashboardCalendarHeader
          currentMonth={currentMonth}
          monthEventCount={monthEventCount}
          onNavigate={navigate}
          unitFilter={unitFilter}
          onUnitFilterChange={setUnitFilter}
        />{' '}
        <DashboardOperationalPanels
          operationalAlerts={operationalAlerts}
          teamSchedule={teamSchedule}
          financialClosings={financialClosings}
          supplyForecasts={supplyForecasts}
          onNavigate={navigate}
        />
        <CalendarView events={filteredEvents} month={calendarMonth} onMonthChange={setCalendarMonth} />
      </div>
      {showInfo && <DashboardInfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
