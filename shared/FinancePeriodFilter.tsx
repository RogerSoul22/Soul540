import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  formatFinancePeriodLabel,
  createMonthRangePeriod,
  getFinancePeriodForPreset,
  getShiftedFinancePeriod,
  type FinancePeriod,
  type FinancePeriodPreset,
} from './financePeriod';
import { isDateOnly } from './financeDates';
import styles from './FinancePeriodFilter.module.scss';

const PRESETS: Array<{ value: FinancePeriodPreset; label: string }> = [
  { value: 'this_week', label: 'Esta semana' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'this_year', label: 'Este ano' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
  { value: 'last_12_months', label: 'Últimos 12 meses' },
  { value: 'all_time', label: 'Todo o período' },
  { value: 'custom', label: 'Período personalizado' },
];

interface FinancePeriodFilterProps {
  period: FinancePeriod;
  onChange: (period: FinancePeriod) => void;
  accentColor: string;
}

export default function FinancePeriodFilter({ period, onChange, accentColor }: FinancePeriodFilterProps) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState<'month' | 'date'>('month');
  const filterRef = useRef<HTMLDivElement>(null);
  const style = { '--finance-period-accent': accentColor } as CSSProperties;

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const selectPreset = (preset: FinancePeriodPreset) => {
    if (preset === 'custom') {
      const today = getFinancePeriodForPreset('this_month').end;
      setCustomMode('month');
      onChange({
        preset,
        start: isDateOnly(period.start) ? period.start : today,
        end: isDateOnly(period.end) ? period.end : today,
      });
      return;
    }
    onChange(getFinancePeriodForPreset(preset));
    setOpen(false);
  };

  const updateCustomDate = (field: 'start' | 'end', value: string) => {
    const next = { ...period, preset: 'custom' as const, [field]: value };
    if (next.start && next.end && next.start > next.end) return;
    onChange(next);
  };

  const monthValue = (date: string) => isDateOnly(date) ? date.slice(0, 7) : '';
  const updateCustomMonth = (field: 'start' | 'end', value: string) => {
    const startMonth = field === 'start' ? value : monthValue(period.start);
    const endMonth = field === 'end' ? value : monthValue(period.end);
    if (!startMonth || !endMonth || startMonth > endMonth) return;
    onChange(createMonthRangePeriod(startMonth, endMonth));
  };

  return (
    <div ref={filterRef} className={styles.filter} style={style}>
      <span className={styles.label}>Período</span>
      <div className={styles.controlRow}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => onChange(getShiftedFinancePeriod(period, -1))}
          disabled={period.preset === 'all_time'}
          aria-label="Período anterior"
        >
          ‹
        </button>
        <button
          type="button"
          className={styles.periodButton}
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span>{formatFinancePeriodLabel(period)}</span>
          <span className={styles.chevron} aria-hidden="true">⌄</span>
        </button>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => onChange(getShiftedFinancePeriod(period, 1))}
          disabled={period.preset === 'all_time'}
          aria-label="Próximo período"
        >
          ›
        </button>
      </div>
      {open && (
        <div className={styles.menu} role="menu" aria-label="Opções de período">
          {PRESETS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              className={`${styles.option} ${period.preset === option.value ? styles.optionActive : ''}`}
              onClick={() => selectPreset(option.value)}
            >
              {option.label}
            </button>
          ))}
          {period.preset === 'custom' && (
            <div className={styles.customDates}>
              <div className={styles.customMode}>
                <button type="button" className={customMode === 'month' ? styles.customModeActive : ''} onClick={() => setCustomMode('month')}>Mês e ano</button>
                <button type="button" className={customMode === 'date' ? styles.customModeActive : ''} onClick={() => setCustomMode('date')}>Dias exatos</button>
              </div>
              {customMode === 'month' ? (
                <>
                  <label>
                    Mês inicial
                    <input type="month" value={monthValue(period.start)} max={monthValue(period.end) || undefined} onChange={(event) => updateCustomMonth('start', event.target.value)} />
                  </label>
                  <label>
                    Mês final
                    <input type="month" value={monthValue(period.end)} min={monthValue(period.start) || undefined} onChange={(event) => updateCustomMonth('end', event.target.value)} />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Data inicial
                    <input type="date" value={period.start} max={period.end || undefined} onChange={(event) => updateCustomDate('start', event.target.value)} />
                  </label>
                  <label>
                    Data final
                    <input type="date" value={period.end} min={period.start || undefined} onChange={(event) => updateCustomDate('end', event.target.value)} />
                  </label>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
