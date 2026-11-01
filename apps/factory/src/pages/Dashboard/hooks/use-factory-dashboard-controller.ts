import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import {
  buildEmployeeSchedule,
  getEventFinancialClosing,
  type OperationalEmployee,
} from '../../../../../../shared/events/eventOperations';
import { getUpcomingOperationalAlerts } from '../../../../../../shared/events/eventInsights';
import { apiFetch } from '../../../lib/api';
import {
  getDashboardGreeting as getGreeting,
  parseDashboardEventDate as parseEventDate,
} from '../../../../../../packages/screens/src/index';
import type { ProductionOrder } from '../types/dashboard-types';

export function useFactoryDashboardController() {
  const { events, tasks, finances, dataLoading } = useApp();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<OperationalEmployee[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

  useEffect(() => {
    apiFetch('/api/employees')
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setEmployees(data))
      .catch(() => {});
    apiFetch('/api/production-orders')
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setProductionOrders(data))
      .catch(() => {});
  }, []);

  const urgentTaskCount = useMemo(
    () => tasks.filter((task) => task.priority === 'urgent' && task.status !== 'done').length,
    [tasks],
  );
  const now = new Date();
  const monthEventCount = useMemo(
    () =>
      events.filter((event) => {
        const date = parseEventDate(event.date);
        return date ? date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() : false;
      }).length,
    [events, now],
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
        .map((event) => ({ event, closing: getEventFinancialClosing(event, finances) })),
    [events, finances],
  );
  const activeProductionOrders = useMemo(
    () =>
      productionOrders
        .filter((order) => order.status === 'a_preparar' || order.status === 'a_enviar')
        .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)),
    [productionOrders],
  );

  return {
    events,
    dataLoading,
    user,
    urgentTaskCount,
    now,
    monthEventCount,
    operationalAlerts,
    teamSchedule,
    financialClosings,
    activeProductionOrders,
    greeting: getGreeting(user?.name),
  };
}
