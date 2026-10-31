import { useEffect, useMemo, useState } from 'react';
import type { ChecklistItem, ChecklistMeta, EventOption, StoredChecklist } from '../types';
import {
  buildItem,
  buildStorageKey,
  formatDate,
  getEventId,
  getEventName,
  getGuestTotal,
  sortEvents,
} from '../utils/checklist-utils';

type Props = {
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
  storageScope: string;
  systemName: string;
};

export function useChecklistEnvio({ apiFetch, storageScope, systemName }: Props) {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [newItem, setNewItem] = useState('');
  const [bulkItems, setBulkItems] = useState('');
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch('/api/events')
      .then(async (res) => {
        if (!res.ok) throw new Error('events_fetch_failed');
        const data = await res.json();
        if (!active) return;
        const list = sortEvents(Array.isArray(data) ? data : []);
        setEvents(list);
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get('evento') || '';
        const fallback = list.find((event) => getEventId(event) === fromUrl) ? fromUrl : getEventId(list[0] || {});
        setSelectedEventId(fallback);
      })
      .catch(() => {
        if (active) setEvents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [apiFetch]);

  const selectedEvent = useMemo(
    () => events.find((event) => getEventId(event) === selectedEventId),
    [events, selectedEventId],
  );
  const storageKey = useMemo(() => buildStorageKey(storageScope, selectedEventId), [storageScope, selectedEventId]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const stored = raw ? JSON.parse(raw) as Partial<StoredChecklist> : {};
      setItems(Array.isArray(stored.items) ? stored.items : []);
      setChecked(stored.checked && typeof stored.checked === 'object' ? stored.checked : {});
    } catch {
      setItems([]);
      setChecked({});
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ items, checked }));
    } catch {
      // localStorage may be unavailable in private contexts.
    }
  }, [checked, items, storageKey]);

  const totalItems = items.length;
  const completed = items.filter((item) => checked[item.id]).length;
  const progress = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
  const removeTarget = items.find((item) => item.id === removeTargetId);
  const guestTotal = getGuestTotal(selectedEvent);
  const meta: ChecklistMeta[] = [
    { label: 'Sistema', value: systemName },
    { label: 'Data', value: selectedEvent ? `${formatDate(selectedEvent.date)}${selectedEvent.time ? ` as ${selectedEvent.time}` : ''}` : 'Sem evento' },
    { label: 'Local', value: selectedEvent?.location || selectedEvent?.city || 'Nao informado' },
    { label: 'Convidados', value: guestTotal ? String(guestTotal) : 'Nao informado' },
    { label: 'Cardapio', value: selectedEvent?.menu?.length ? selectedEvent.menu.join(', ') : 'Nao informado' },
    { label: 'Pizzas', value: selectedEvent?.estimatedPizzas ? String(selectedEvent.estimatedPizzas) : 'Nao informado' },
  ];

  const showFeedback = (message: string, time = 1800) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), time);
  };

  const setEventFromSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const url = new URL(window.location.href);
    if (eventId) url.searchParams.set('evento', eventId);
    else url.searchParams.delete('evento');
    window.history.replaceState(null, '', url.toString());
  };

  const addItems = (texts: string[]) => {
    const clean = texts.map((text) => text.trim()).filter(Boolean);
    if (clean.length === 0) return;
    setItems((current) => [...current, ...clean.map(buildItem)]);
    showFeedback(`${clean.length} item(ns) adicionado(s)`);
  };

  const addSingleItem = () => {
    addItems([newItem]);
    setNewItem('');
  };

  const addBulkItems = () => {
    addItems(bulkItems.split(/\r?\n/));
    setBulkItems('');
  };

  const toggleItem = (id: string) => {
    setChecked((current) => ({ ...current, [id]: !current[id] }));
  };

  const updateItem = (id: string, text: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setChecked((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setRemoveTargetId(null);
  };

  const clearChecklist = () => {
    setItems([]);
    setChecked({});
    setNewItem('');
    setBulkItems('');
    showFeedback('Checklist limpo');
  };

  const copyLink = async () => {
    const url = new URL(window.location.href);
    if (selectedEventId) url.searchParams.set('evento', selectedEventId);
    try {
      await navigator.clipboard.writeText(url.toString());
      showFeedback('Link copiado', 2500);
    } catch {
      showFeedback(url.toString(), 2500);
    }
  };

  return {
    bulkItems,
    checked,
    clearChecklist,
    completed,
    copyLink,
    events,
    feedback,
    items,
    loading,
    meta,
    newItem,
    progress,
    removeItem,
    removeTarget,
    requestRemoveItem: setRemoveTargetId,
    selectedEvent,
    selectedEventId,
    setBulkItems,
    setEventFromSelect,
    setNewItem,
    setRemoveTargetId,
    addBulkItems,
    addSingleItem,
    toggleItem,
    totalItems,
    updateItem,
  };
}
