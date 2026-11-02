import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { DaysGrid, MonthsGrid } from './DatePickerGrids';
import styles from './DatePickerPanel.module.css';
import {
  addDays,
  addMonths,
  capitalize,
  isOutOfRange,
  MONTHS_LONG,
  parseValue,
  todayParts,
  toValue,
  type DatePickerType,
  type DateParts,
} from './date-utils';

interface PanelProps {
  type: DatePickerType;
  value: string;
  min?: string;
  max?: string;
  anchor: HTMLElement;
  onPick: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const PANEL_HEIGHT = 380;

export function DatePickerPanel({ type, value, min, max, anchor, onPick, onClear, onClose }: PanelProps) {
  const [cursor, setCursor] = useState<DateParts>(() => parseValue(value) ?? todayParts());
  const [view, setView] = useState<'days' | 'months'>(type === 'month' ? 'months' : 'days');
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const panelRef = useRef<HTMLDivElement>(null);
  const today = todayParts();
  const selected = parseValue(value);

  useLayoutEffect(() => {
    const rect = anchor.getBoundingClientRect();
    const above = window.innerHeight - rect.bottom < PANEL_HEIGHT && rect.top > window.innerHeight - rect.bottom;
    setStyle({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 304)),
      ...(above ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    });
  }, [anchor]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      } else if (view === 'days' && event.key in step) {
        event.preventDefault();
        setCursor((current) => addDays(current, step[event.key]));
      } else if (view === 'days' && (event.key === 'PageUp' || event.key === 'PageDown')) {
        event.preventDefault();
        setCursor((current) => addMonths(current, event.key === 'PageUp' ? -1 : 1));
      } else if (view === 'days' && event.key === 'Enter') {
        event.preventDefault();
        const next = toValue('date', cursor);
        if (!isOutOfRange(next, min, max)) onPick(next);
      }
    };
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !anchor.contains(target)) onClose();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('mousedown', outside);
    window.addEventListener('scroll', outside, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('mousedown', outside);
      window.removeEventListener('scroll', outside, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, cursor, max, min, onClose, onPick, view]);

  const title = view === 'days' ? `${capitalize(MONTHS_LONG[cursor.month])} ${cursor.year}` : String(cursor.year);

  return createPortal(
    <div ref={panelRef} className={styles.panel} style={style} role="dialog" aria-label="Escolher data">
      <div className={styles.header}>
        <button
          type="button"
          className={styles.nav}
          aria-label={view === 'days' ? 'Mês anterior' : 'Ano anterior'}
          onClick={() => setCursor((current) => addMonths(current, view === 'days' ? -1 : -12))}
        >
          ‹
        </button>
        <button
          type="button"
          className={styles.title}
          disabled={type === 'month'}
          onClick={() => setView((current) => (current === 'days' ? 'months' : 'days'))}
        >
          {title}
        </button>
        <button
          type="button"
          className={styles.nav}
          aria-label={view === 'days' ? 'Próximo mês' : 'Próximo ano'}
          onClick={() => setCursor((current) => addMonths(current, view === 'days' ? 1 : 12))}
        >
          ›
        </button>
      </div>

      {view === 'months' ? (
        <MonthsGrid
          type={type}
          cursor={cursor}
          selected={selected}
          today={today}
          min={min}
          max={max}
          onPickMonth={(month) =>
            type === 'month' ? onPick(toValue('month', month)) : (setCursor(month), setView('days'))
          }
        />
      ) : (
        <DaysGrid cursor={cursor} selected={selected} today={today} min={min} max={max} onPick={onPick} />
      )}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.action}
          onClick={() => onPick(toValue(type, todayParts()))}
          disabled={isOutOfRange(toValue(type, todayParts()), min, max)}
        >
          {type === 'month' ? 'Este mês' : 'Hoje'}
        </button>
        <button type="button" className={styles.action} onClick={onClear}>
          Limpar
        </button>
      </div>
    </div>,
    document.body,
  );
}
