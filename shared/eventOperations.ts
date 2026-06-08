import type { FinanceEntry, PizzaEvent } from './types';

export type OperationalEmployee = {
  id: string;
  name: string;
  role?: string;
  status?: string;
};

export interface EmployeeScheduleItem {
  employeeId: string;
  employeeName: string;
  events: PizzaEvent[];
}

export interface AvailabilityConflict {
  employeeId: string;
  employeeName: string;
  eventName: string;
  eventDate: string;
}

export interface EventFinancialClosing {
  estimatedRevenue: number;
  realizedRevenue: number;
  realizedCosts: number;
  realizedResult: number;
  difference: number;
  statusLabel: string;
}

export interface EventSupplyForecast {
  guests: number;
  pizzas: number;
  doughBalls: number;
  flourKg: number;
  sauceKg: number;
  cheeseKg: number;
  sweetPizzas: number;
  savoryPizzas: number;
  menuFactor: number;
}

function unique(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function eventDay(value: string | undefined): string {
  return (value || '').slice(0, 10);
}

export function getEventEmployeeIds(event: Partial<PizzaEvent>, employees: OperationalEmployee[] = []): string[] {
  const employeeIds = new Set(employees.map((employee) => employee.id));
  return unique([
    event.responsibleEmployeeId,
    event.teamPizzaiolo,
    event.teamHelper,
    event.teamGarcon,
    ...(event.selectedEmployeeIds || []),
  ]).filter((id) => employeeIds.size === 0 || employeeIds.has(id));
}

export function buildEmployeeSchedule(
  events: PizzaEvent[],
  employees: OperationalEmployee[],
  options: { limit?: number; from?: Date } = {},
): EmployeeScheduleItem[] {
  const fromDay = eventDay((options.from || new Date()).toISOString());
  const limit = options.limit ?? 8;

  return employees
    .filter((employee) => employee.status !== 'inativo')
    .map((employee) => ({
      employeeId: employee.id,
      employeeName: employee.name,
      events: events
        .filter((event) => event.status !== 'cancelled')
        .filter((event) => eventDay(event.date) >= fromDay)
        .filter((event) => getEventEmployeeIds(event, employees).includes(employee.id))
        .sort((a, b) => eventDay(a.date).localeCompare(eventDay(b.date)))
        .slice(0, limit),
    }))
    .filter((item) => item.events.length > 0)
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'pt-BR'));
}

export function getAvailabilityConflicts(
  target: Partial<PizzaEvent>,
  events: PizzaEvent[],
  employees: OperationalEmployee[],
  editingId?: string,
): AvailabilityConflict[] {
  const ids = getEventEmployeeIds(target, employees);
  const targetDay = eventDay(target.date);
  if (!targetDay || ids.length === 0) return [];

  return events
    .filter((event) => event.id !== editingId)
    .filter((event) => event.status !== 'cancelled')
    .filter((event) => eventDay(event.date) === targetDay)
    .flatMap((event) => {
      const assigned = getEventEmployeeIds(event, employees);
      return ids
        .filter((id) => assigned.includes(id))
        .map((id) => ({
          employeeId: id,
          employeeName: employees.find((employee) => employee.id === id)?.name || id,
          eventName: event.name,
          eventDate: event.date,
        }));
    });
}

export function getEventFinancialClosing(event: PizzaEvent, finances: FinanceEntry[] = []): EventFinancialClosing {
  const estimatedRevenue = event.finalValue && event.finalValue > 0 ? event.finalValue : event.budget || 0;
  const eventFinances = finances.filter((entry) => entry.eventId === event.id);
  const realizedRevenue = eventFinances
    .filter((entry) => entry.type === 'revenue' && ['paid', 'received'].includes(entry.status))
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const realizedCosts = eventFinances
    .filter((entry) => entry.type === 'cost' && ['paid', 'received'].includes(entry.status))
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const realizedResult = realizedRevenue - realizedCosts;
  const difference = realizedResult - estimatedRevenue;

  return {
    estimatedRevenue,
    realizedRevenue,
    realizedCosts,
    realizedResult,
    difference,
    statusLabel: realizedRevenue <= 0 ? 'Sem realizado' : difference >= 0 ? 'Acima do estimado' : 'Abaixo do estimado',
  };
}

export function getEventSupplyForecast(event: Partial<PizzaEvent>): EventSupplyForecast {
  const categorizedGuests = (event.guestsAdult || 0) + (event.guestsTeen || 0) + (event.guestsChild || 0);
  const guests = categorizedGuests > 0 ? categorizedGuests : event.guestCount || 0;
  const menuText = (event.menu || []).join(' ').toLowerCase();
  const menuFactor = menuText.includes('raffinato') ? 1.12 : menuText.includes('superiore') ? 1.06 : 1;
  const basePizzas = event.estimatedPizzas && event.estimatedPizzas > 0
    ? event.estimatedPizzas
    : Math.ceil((((event.guestsAdult || guests) * 0.42) + ((event.guestsTeen || 0) * 0.32) + ((event.guestsChild || 0) * 0.16)) * menuFactor);
  const pizzas = Math.max(0, basePizzas);

  return {
    guests,
    pizzas,
    doughBalls: pizzas,
    flourKg: Number((pizzas * 0.18).toFixed(1)),
    sauceKg: Number((pizzas * 0.08).toFixed(1)),
    cheeseKg: Number((pizzas * 0.12).toFixed(1)),
    savoryPizzas: Math.ceil(pizzas * 0.82),
    sweetPizzas: Math.max(0, pizzas - Math.ceil(pizzas * 0.82)),
    menuFactor,
  };
}
