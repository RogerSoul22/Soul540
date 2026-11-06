import { useEffect, useState, type FocusEventHandler, type KeyboardEventHandler, type Ref } from 'react';
import styles from './DatePicker.module.css';
import { formatDisplay, isOutOfRange, parseDisplayInput, type DatePickerType } from './date-utils';

const INVALID_MESSAGE = 'Informe uma data válida dentro do período permitido.';

interface DatePickerControlProps {
  type: DatePickerType;
  id: string;
  value: string;
  placeholder: string;
  className: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  maxLength?: number;
  minLength?: number;
  title?: string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  min?: string;
  max?: string;
  anchorRef: Ref<HTMLButtonElement>;
  open: boolean;
  onToggle: () => void;
  onValueChange: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
}

function CalendarIcon() {
  return (
    <svg
      className={styles.icon}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function DatePickerControl({
  type, id, value, placeholder, className, disabled, readOnly, required, min, max,
  autoComplete, autoFocus, inputMode, maxLength, minLength, title, onKeyDown,
  anchorRef, open, onToggle, onValueChange, onBlur, onFocus,
}: DatePickerControlProps) {
  const [draft, setDraft] = useState(formatDisplay(type, value));
  const [focused, setFocused] = useState(false);
  const parsed = parseDisplayInput(type, draft);
  const outOfRange = Boolean(parsed && isOutOfRange(parsed, min, max));
  const invalid = draft.trim() !== '' && (!parsed || outOfRange);

  useEffect(() => {
    if (!focused) setDraft(formatDisplay(type, value));
  }, [focused, type, value]);

  return (
    <div className={styles.control}>
      <input
        id={id}
        type="text"
        className={`${styles.entry} ${className}`.trim()}
        value={draft}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        inputMode={inputMode}
        maxLength={maxLength}
        minLength={minLength}
        title={title}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          const normalized = parseDisplayInput(type, next);
          const nextInvalid = next.trim() !== '' && (!normalized || isOutOfRange(normalized, min, max));
          event.currentTarget.setCustomValidity(nextInvalid ? INVALID_MESSAGE : '');
          onValueChange(normalized && !isOutOfRange(normalized, min, max) ? normalized : '');
        }}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onKeyDown={onKeyDown}
        onBlur={(event) => {
          setFocused(false);
          event.currentTarget.setCustomValidity(invalid ? INVALID_MESSAGE : '');
          if (parsed && !outOfRange) setDraft(formatDisplay(type, parsed));
          onBlur?.(event);
        }}
      />
      <button
        ref={anchorRef}
        type="button"
        className={styles.calendarButton}
        disabled={disabled || readOnly}
        aria-label="Abrir calendário"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onToggle}
      >
        <CalendarIcon />
      </button>
      {invalid && (
        <span id={`${id}-error`} className={styles.validation} role="alert">
          {INVALID_MESSAGE}
        </span>
      )}
    </div>
  );
}
