import { useEffect } from 'react';
import type { FinanceType } from '../../../../../../packages/contracts/src/index';
import { apiFetch } from '../../../lib/api';
import type { FinanceiroState } from './use-financeiro-state';
type FinanceiroEffectsState = Pick<
  FinanceiroState,
  | 'searchParams'
  | 'setSearchParams'
  | 'dataScope'
  | 'setFranchises'
  | 'setFranchiseFinances'
  | 'setFranchiseEvents'
  | 'setFactoryFinances'
  | 'setFactoryEvents'
  | 'showForm'
  | 'setFormType'
  | 'setShowForm'
  | 'setDirectEvents'
  | 'showEventDropdown'
  | 'eventComboRef'
  | 'setShowEventDropdown'
>;

export function useFinanceiroEffects(state: FinanceiroEffectsState) {
  const {
    searchParams,
    setSearchParams,
    dataScope,
    setFranchises,
    setFranchiseFinances,
    setFranchiseEvents,
    setFactoryFinances,
    setFactoryEvents,
    showForm,
    setFormType,
    setShowForm,
    setDirectEvents,
    showEventDropdown,
    eventComboRef,
    setShowEventDropdown,
  } = state;
  useEffect(() => {
    apiFetch('/api/franchises', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setFranchises(d))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const type = searchParams.get('type') as FinanceType | null;
      if (type) setFormType(type);
      setShowForm(true);
      setSearchParams({});
    }
  }, []);
  useEffect(() => {
    if (dataScope === 'main') {
      setFranchiseFinances([]);
      setFranchiseEvents([]);
      setFactoryFinances([]);
      setFactoryEvents([]);
      return;
    }
    if (dataScope === 'franchise' || dataScope === 'combined') {
      const h: HeadersInit = { 'X-System': 'main' };
      apiFetch('/api/finances?scope=franchise', { headers: h, credentials: 'include' })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setFranchiseFinances(d))
        .catch(() => {});
      apiFetch('/api/events?scope=franchise', { headers: h, credentials: 'include' })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setFranchiseEvents(d))
        .catch(() => {});
    }
    if (dataScope === 'factory' || dataScope === 'combined') {
      const h: HeadersInit = { 'X-System': 'main' };
      apiFetch('/api/finances?scope=factory', { headers: h, credentials: 'include' })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setFactoryFinances(d))
        .catch(() => {});
      apiFetch('/api/events?scope=factory', { headers: h, credentials: 'include' })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setFactoryEvents(d))
        .catch(() => {});
    }
  }, [dataScope]);
  useEffect(() => {
    if (!showForm) return;
    apiFetch('/api/events', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-System': 'main' },
    })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setDirectEvents(d);
      })
      .catch(() => {});
  }, [showForm]);
  useEffect(() => {
    if (!showEventDropdown) return;
    const handler = (e: MouseEvent) => {
      if (eventComboRef.current && !eventComboRef.current.contains(e.target as Node)) {
        setShowEventDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEventDropdown]);
}
