import { useEffect, useMemo, useState } from 'react';
import styles from './ChecklistEnvioPage.module.scss';

type EventOption = {
  id?: string;
  _id?: string;
  name?: string;
  celebration?: string;
  date?: string;
  time?: string;
  location?: string;
  city?: string;
  guestCount?: number;
  guestsAdult?: number;
  guestsTeen?: number;
  guestsChild?: number;
  menu?: string[];
  estimatedPizzas?: number;
};

type ChecklistItem = {
  id: string;
  text: string;
};

type StoredChecklist = {
  items: ChecklistItem[];
  checked: Record<string, boolean>;
};

type Props = {
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
  storageScope: string;
  systemName: string;
};

function getEventId(event: EventOption) {
  return event.id || event._id || '';
}

function parseSafeDate(value?: string) {
  if (!value) return null;
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string) {
  const date = parseSafeDate(value);
  if (!date) return 'Sem data';
  return date.toLocaleDateString('pt-BR');
}

function getEventName(event?: EventOption) {
  if (!event) return 'Checklist geral';
  return event.name || event.celebration || 'Evento sem nome';
}

function getGuestTotal(event?: EventOption) {
  if (!event) return 0;
  const splitTotal = Number(event.guestsAdult || 0) + Number(event.guestsTeen || 0) + Number(event.guestsChild || 0);
  return Number(event.guestCount || 0) || splitTotal;
}

function buildStorageKey(scope: string, eventId: string) {
  return `soul540_checklist_envio_${scope}_${eventId || 'geral'}`;
}

function sortEvents(events: EventOption[]) {
  return [...events].sort((a, b) => {
    const da = parseSafeDate(a.date)?.getTime() || Number.MAX_SAFE_INTEGER;
    const db = parseSafeDate(b.date)?.getTime() || Number.MAX_SAFE_INTEGER;
    if (da !== db) return da - db;
    return getEventName(a).localeCompare(getEventName(b), 'pt-BR');
  });
}

function buildItem(text: string): ChecklistItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
  };
}

export default function ChecklistEnvioPage({ apiFetch, storageScope, systemName }: Props) {
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

  const storageKey = useMemo(
    () => buildStorageKey(storageScope, selectedEventId),
    [storageScope, selectedEventId],
  );

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

  const setEventFromSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const url = new URL(window.location.href);
    if (eventId) url.searchParams.set('evento', eventId);
    else url.searchParams.delete('evento');
    window.history.replaceState(null, '', url.toString());
  };

  const showFeedback = (message: string, time = 1800) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), time);
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

  const removeTarget = items.find((item) => item.id === removeTargetId);

  const requestRemoveItem = (id: string) => {
    setRemoveTargetId(id);
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

  const guestTotal = getGuestTotal(selectedEvent);
  const meta = [
    { label: 'Sistema', value: systemName },
    { label: 'Data', value: selectedEvent ? `${formatDate(selectedEvent.date)}${selectedEvent.time ? ` as ${selectedEvent.time}` : ''}` : 'Sem evento' },
    { label: 'Local', value: selectedEvent?.location || selectedEvent?.city || 'Nao informado' },
    { label: 'Convidados', value: guestTotal ? String(guestTotal) : 'Nao informado' },
    { label: 'Cardapio', value: selectedEvent?.menu?.length ? selectedEvent.menu.join(', ') : 'Nao informado' },
    { label: 'Pizzas', value: selectedEvent?.estimatedPizzas ? String(selectedEvent.estimatedPizzas) : 'Nao informado' },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Soul540</p>
            <h1 className={styles.title}>Checklist de envio</h1>
            <p className={styles.subtitle}>Checklist publico e editavel por evento para conferir tudo antes da saida da equipe.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.buttonGhost} type="button" onClick={copyLink}>
              Copiar link
            </button>
            <button className={styles.button} type="button" onClick={clearChecklist}>
              Limpar checklist
            </button>
          </div>
        </header>

        <section className={styles.topGrid}>
          <div className={styles.panel}>
            <div className={styles.panelBody}>
              <label className={styles.label} htmlFor="event-select">Evento</label>
              <select
                id="event-select"
                className={styles.select}
                value={selectedEventId}
                onChange={(event) => setEventFromSelect(event.target.value)}
                disabled={loading || events.length === 0}
              >
                {loading && <option>Carregando eventos...</option>}
                {!loading && events.length === 0 && <option value="">Nenhum evento encontrado</option>}
                {!loading && events.map((event) => {
                  const id = getEventId(event);
                  return (
                    <option key={id} value={id}>
                      {formatDate(event.date)} - {getEventName(event)}
                    </option>
                  );
                })}
              </select>
              <div className={styles.eventMeta}>
                {meta.map((item) => (
                  <div className={styles.metaItem} key={item.label}>
                    <span className={styles.metaLabel}>{item.label}</span>
                    <span className={styles.metaValue} title={item.value}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.panel} ${styles.progressPanel}`}>
            <div className={styles.panelBody}>
              <div className={styles.progressTop}>
                <span className={styles.progressLabel}>{getEventName(selectedEvent)}</span>
                <span className={styles.progressNumber}>{progress}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.progressText}>{completed} de {totalItems} itens conferidos{feedback ? ` - ${feedback}` : ''}</p>
            </div>
          </div>
        </section>

        <section className={styles.editorGrid}>
          <article className={styles.panel}>
            <div className={styles.groupHeader}>
              <h2 className={styles.groupTitle}>Montar checklist</h2>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.addRow}>
                <input
                  className={styles.textInput}
                  value={newItem}
                  onChange={(event) => setNewItem(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSingleItem();
                    }
                  }}
                  placeholder="Digite um item para adicionar"
                />
                <button className={styles.button} type="button" onClick={addSingleItem}>
                  Adicionar item
                </button>
              </div>

              <label className={styles.label} htmlFor="bulk-checklist">Colar lista de itens</label>
              <textarea
                id="bulk-checklist"
                className={styles.textarea}
                value={bulkItems}
                onChange={(event) => setBulkItems(event.target.value)}
                placeholder={'Um item por linha\nConfirmar endereco\nSeparar guardanapos\nLevar gas reserva'}
              />
              <button className={styles.buttonGhost} type="button" onClick={addBulkItems}>
                Adicionar lista
              </button>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.groupHeader}>
              <h2 className={styles.groupTitle}>Itens para envio</h2>
              <span className={styles.groupCount}>{completed}/{totalItems}</span>
            </div>
            <div className={styles.items}>
              {items.length === 0 ? (
                <div className={styles.empty}>Nenhum item escrito ainda.</div>
              ) : (
                items.map((item) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <div className={`${styles.itemEditable} ${isChecked ? styles.itemChecked : ''}`} key={item.id}>
                      <button className={styles.checkboxButton} type="button" onClick={() => toggleItem(item.id)}>
                        <span className={styles.checkbox}>{isChecked ? '✓' : ''}</span>
                      </button>
                      <input
                        className={styles.itemInput}
                        value={item.text}
                        onChange={(event) => updateItem(item.id, event.target.value)}
                      />
                      <button className={styles.removeButton} type="button" onClick={() => requestRemoveItem(item.id)} aria-label="Remover item">
                        x
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>
      </div>

      {removeTarget && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setRemoveTargetId(null)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="remove-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 className={styles.modalTitle} id="remove-title">Remover item?</h2>
            <p className={styles.modalText}>{removeTarget.text}</p>
            <div className={styles.modalActions}>
              <button className={styles.buttonGhost} type="button" onClick={() => setRemoveTargetId(null)}>
                Cancelar
              </button>
              <button className={styles.buttonDanger} type="button" onClick={() => removeItem(removeTarget.id)}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
