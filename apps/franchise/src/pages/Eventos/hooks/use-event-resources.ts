import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import type { EventEmployee } from '../types/event-types';

const STATIC_MENU_NAMES = ['Menu Eccezionale', 'Menu Superiore', 'Menu Raffinato'];

export function useEventResources() {
  const [employees, setEmployees] = useState<EventEmployee[]>([]);
  const [availableMenus, setAvailableMenus] = useState<string[]>(STATIC_MENU_NAMES);
  useEffect(() => {
    apiFetch('/api/employees')
      .then((response) => response.json())
      .then(setEmployees)
      .catch(() => {});
    apiFetch('/api/menus')
      .then((response) => response.json())
      .then((data: { name: string }[]) => {
        if (Array.isArray(data)) {
          const apiNames = data.map((menu) => menu.name).filter((name) => !STATIC_MENU_NAMES.includes(name));
          setAvailableMenus([...STATIC_MENU_NAMES, ...apiNames]);
        }
      })
      .catch(() => {});
  }, []);
  return { employees, availableMenus };
}
