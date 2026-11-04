import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { DatePickerPanel } from './DatePickerPanel';
import { DatePickerControl } from './DatePickerControl';
import styles from './DatePicker.module.css';
import { formatDisplay, type DatePickerType } from './date-utils';
import type { DatePickerProps } from './type';

const PLACEHOLDER: Record<DatePickerType, string> = { date: 'dd/mm/aaaa', month: 'mm/aaaa' };

// O campo visível aceita digitação localizada; o input nativo mantém o valor ISO e seus eventos.
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { type, label, id, className = '', placeholder, disabled, readOnly, value, defaultValue, min, max,
    required, autoComplete, autoFocus, inputMode, maxLength, minLength, title, onKeyDown,
    onBlur, onFocus, ...rest },
  ref,
) {
  const native = useRef<HTMLInputElement | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(String(defaultValue ?? ''));
  const autoId = useId();
  const fieldId = id || autoId;
  const controlled = value !== undefined;
  const current = controlled ? String(value) : typed;

  const setNative = useCallback((element: HTMLInputElement | null) => {
    native.current = element;
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  }, [ref]);

  useEffect(() => {
    const element = native.current;
    if (!element || controlled) return;
    const sync = () => setTyped(element.value);
    element.addEventListener('input', sync);
    return () => element.removeEventListener('input', sync);
  }, [controlled]);

  const commit = useCallback((next: string, close = true) => {
    const element = native.current;
    if (!element) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(element, next);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    if (close) {
      setOpen(false);
      trigger.current?.focus();
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const pick = useCallback((next: string) => commit(next), [commit]);
  const clear = useCallback(() => commit(''), [commit]);
  const control = (
    <>
      <DatePickerControl
        type={type}
        id={fieldId}
        value={current}
        placeholder={placeholder || PLACEHOLDER[type]}
        className={className}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        inputMode={inputMode}
        maxLength={maxLength}
        minLength={minLength}
        title={title}
        onKeyDown={onKeyDown}
        min={min === undefined ? undefined : String(min)}
        max={max === undefined ? undefined : String(max)}
        anchorRef={trigger}
        open={open}
        onToggle={() => !readOnly && setOpen((state) => !state)}
        onValueChange={(next) => commit(next, false)}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <input
        ref={setNative}
        type={type}
        className={styles.native}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        readOnly={readOnly}
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : defaultValue}
        min={min}
        max={max}
        {...rest}
      />
      {open && trigger.current && (
        <DatePickerPanel
          type={type}
          value={current}
          min={min === undefined ? undefined : String(min)}
          max={max === undefined ? undefined : String(max)}
          anchor={trigger.current}
          onPick={pick}
          onClear={clear}
          onClose={close}
        />
      )}
    </>
  );

  if (!label) return control;
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      {control}
    </div>
  );
});
