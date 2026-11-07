import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  buildEmployeeSchedule,
  getEventFinancialClosing,
  getEventSupplyForecast,
  type OperationalEmployee,
} from '../../../../../../shared/events/eventOperations';
import { getUpcomingOperationalAlerts } from '../../../../../../shared/events/eventInsights';
import { apiFetch } from '../../../lib/api';
import {
  getDashboardGreeting as getGreeting,
  parseDashboardEventDate as parseEventDate,
} from '../../../../../../packages/screens/src/index';

export function useDashboardController() {
  const { events, tasks, finances, dataLoading } = useApp();
  const { user } = useAuth();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [employees, setEmployees] = useState<OperationalEmployee[]>([]);

  useEffect(() => {
    apiFetch('/api/employees')
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setEmployees(data))
      .catch(() => {});
  }, []);

  const urgentTaskCount = useMemo(
    () => tasks.filter((task) => task.priority === 'urgent' && task.status !== 'done').length,
    [tasks],
  );
  const monthEventCount = useMemo(
    () =>
      events.filter((event) => {
        const date = parseEventDate(event.date);
        return date
          ? date.getMonth() === calendarMonth.getMonth() && date.getFullYear() === calendarMonth.getFullYear()
          : false;
      }).length,
    [events, calendarMonth],
  );
  const operationalAlerts = useMemo(() => getUpcomingOperationalAlerts(events, { limit: 4 }), [events]);
  const teamSchedule = useMemo(
    () => buildEmployeeSchedule(events, employees, { limit: 3 }).slice(0, 4),
    [events, employees],
  );
  const financialClosings = useMemo(
    () =>
      events
        .filter((event) => event.status === 'completed')
        .filter((event) => parseEventDate(event.date))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 3)
        .map((event) => ({
          event,
          closing: getEventFinancialClosing(event, finances),
        })),
    [events, finances],
  );

  return {
    events,
    dataLoading,
    user,
    calendarMonth,
    setCalendarMonth,
    urgentTaskCount,
    monthEventCount,
    operationalAlerts,
    teamSchedule,
    financialClosings,
    greeting: getGreeting(user?.name),
  };
}
