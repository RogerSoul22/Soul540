import { useState } from 'react';
import type { PizzaEvent } from '../../../types/Event';

export function useEventViewState() {
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(['recurringTemplates', 'orcamentos', 'confirmados', 'finalizados', 'cancelados']),
  );
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<PizzaEvent | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const toggleSection = (key: string) =>
    setCollapsedSections((previous) => {
      const next = new Set(previous);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const toggleMonth = (key: string) =>
    setExpandedMonths((previous) => {
      const next = new Set(previous);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  return {
    showMenuDropdown,
    setShowMenuDropdown,
    expandedMonths,
    collapsedSections,
    deleteTargetId,
    setDeleteTargetId,
    viewingEvent,
    setViewingEvent,
    showInfo,
    setShowInfo,
    toggleSection,
    toggleMonth,
  };
}
