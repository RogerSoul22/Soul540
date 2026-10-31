import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useApp } from '../../../contexts/AppContext';
import type { PizzaEvent } from '../../../../../../packages/contracts/src/index';
import { getEventSupplyForecast } from '../../../../../../shared/events/eventOperations';
import { groupByMonth } from '../support/event-formatters';
import type { FactoryEventEmployee } from '../types/event-types';

export type FactoryProductionForm = {
  factoryProductionStatus: string;
  factoryProductionNotes: string;
  factoryDoughBalls: string;
  factorySauceKg: string;
  factoryCheeseKg: string;
  factoryPackagingUnits: string;
  actualPizzas: string;
};

const emptyProductionForm: FactoryProductionForm = {
  factoryProductionStatus: 'pending',
  factoryProductionNotes: '',
  factoryDoughBalls: '',
  factorySauceKg: '',
  factoryCheeseKg: '',
  factoryPackagingUnits: '',
  actualPizzas: '',
};

export function useFactoryEventController() {
  const { events, updateEvent } = useApp();
  const [employees, setEmployees] = useState<FactoryEventEmployee[]>([]);
  const [search, setSearch] = useState('');
  const [viewingEvent, setViewingEvent] = useState<PizzaEvent | null>(null);
  const [productionForm, setProductionForm] = useState<FactoryProductionForm>(emptyProductionForm);
  const [showInfo, setShowInfo] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  useEffect(() => {
    apiFetch('/api/employees')
      .then((response) => response.json())
      .then(setEmployees)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!viewingEvent) return;
    const forecast = getEventSupplyForecast(viewingEvent);
    setProductionForm({
      factoryProductionStatus: viewingEvent.factoryProductionStatus || 'pending',
      factoryProductionNotes: viewingEvent.factoryProductionNotes || '',
      factoryDoughBalls: String(viewingEvent.factoryDoughBalls ?? forecast.doughBalls),
      factorySauceKg: String(viewingEvent.factorySauceKg ?? forecast.sauceKg),
      factoryCheeseKg: String(viewingEvent.factoryCheeseKg ?? forecast.cheeseKg),
      factoryPackagingUnits: String(viewingEvent.factoryPackagingUnits ?? forecast.pizzas),
      actualPizzas: String(viewingEvent.actualPizzas ?? ''),
    });
  }, [viewingEvent]);
  const employeeMap = useMemo(
    () => Object.fromEntries(employees.map((employee) => [employee.id, employee.name])),
    [employees],
  );
  const filtered = useMemo(() => {
    const matching = events
      .filter((event) => !search || event.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
      fechados: matching.filter((event) => event.status !== 'planning'),
      orcamentos: matching.filter((event) => event.status === 'planning'),
    };
  }, [events, search]);
  const monthGroupsFechados = useMemo(() => groupByMonth(filtered.fechados), [filtered.fechados]);
  const toggleMonth = (key: string) =>
    setExpandedMonths((previous) => {
      const next = new Set(previous);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const event = viewingEvent;
  const productionForecast = event ? getEventSupplyForecast(event) : null;
  const totalGuests = event
    ? (event.guestsAdult ?? 0) + (event.guestsTeen ?? 0) + (event.guestsChild ?? 0) || event.guestCount || 0
    : 0;
  const saveProduction = async () => {
    if (!event) return;
    const data = {
      factoryProductionStatus: productionForm.factoryProductionStatus as PizzaEvent['factoryProductionStatus'],
      factoryProductionNotes: productionForm.factoryProductionNotes || undefined,
      factoryDoughBalls: Number(productionForm.factoryDoughBalls) || undefined,
      factorySauceKg: Number(productionForm.factorySauceKg) || undefined,
      factoryCheeseKg: Number(productionForm.factoryCheeseKg) || undefined,
      factoryPackagingUnits: Number(productionForm.factoryPackagingUnits) || undefined,
      actualPizzas: Number(productionForm.actualPizzas) || undefined,
    };
    await updateEvent(event.id, data);
    setViewingEvent((current) => (current ? { ...current, ...data } : current));
  };
  return {
    events,
    updateEvent,
    employees,
    employeeMap,
    search,
    setSearch,
    filtered,
    monthGroupsFechados,
    expandedMonths,
    toggleMonth,
    viewingEvent,
    setViewingEvent,
    showInfo,
    setShowInfo,
    productionForm,
    setProductionForm,
    productionForecast,
    totalGuests,
    saveProduction,
  };
}
export type FactoryEventController = ReturnType<typeof useFactoryEventController>;
