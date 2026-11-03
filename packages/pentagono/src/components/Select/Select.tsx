import { forwardRef, useCallback, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import styles from './Select.module.css';
import { SelectMenu } from './SelectMenu';
import { commitSelectValue } from './select-items';
import type { SelectProps } from './type';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`.trim()}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// O <select> nativo continua na tela (invisível) como fonte de valor, onChange e ref; a lista aberta é do Pentágono.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, id, variant = 'default', className = '', children, disabled, searchable = false, ...rest },
  ref,
) {
  const native = useRef<HTMLSelectElement | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const autoId = useId();
  const selectId = id || (label ? label.toLowerCase().replace(/\s/g, '-') : autoId);

  useLayoutEffect(() => {
    const current = native.current?.selectedOptions[0]?.text ?? '';
    if (current !== text) setText(current);
  });

  const close = useCallback(() => setOpen(false), []);
  const pick = useCallback((value: string) => {
    if (native.current) commitSelectValue(native.current, value);
    setOpen(false);
    trigger.current?.focus();
  }, []);

  const setNative = (element: HTMLSelectElement | null) => {
    native.current = element;
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  };

  const openWithArrows = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    setOpen(true);
  };

  const control = (
    <>
      <button
        ref={trigger}
        id={selectId}
        type="button"
        className={`${styles.trigger} ${styles[variant]} ${className}`.trim()}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={openWithArrows}
      >
        <span className={styles.value}>{text}</span>
        <Chevron open={open} />
      </button>
      <select ref={setNative} className={styles.native} tabIndex={-1} aria-hidden="true" disabled={disabled} {...rest}>
        {children}
      </select>
      {open && native.current && trigger.current && (
        <SelectMenu
          native={native.current}
          anchor={trigger.current}
          onPick={pick}
          onClose={close}
          searchable={searchable}
        />
      )}
    </>
  );

  if (!label) return control;

  return (
    <div className={styles.field}>
      <label htmlFor={selectId}>{label}</label>
      {control}
    </div>
  );
});
