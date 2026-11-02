import { forwardRef, useCallback, useRef, useState } from 'react';
import { DatePicker } from '../DatePicker/DatePicker';
import { ClearButton } from './ClearButton';
import { PasswordToggle } from './PasswordToggle';
import controls from './Input.controls.module.css';
import styles from './Input.module.css';
import type { InputProps } from './type';
import { isClearableType, useAnchorPosition, useClearable } from './use-clearable';

const TextInput = forwardRef<HTMLInputElement, InputProps>(function TextInput(
  { label, error, icon, variant = 'default', type = 'text', id, className = '', clearable = true, style, ...rest },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const inner = useRef<HTMLInputElement | null>(null);
  const [element, setElement] = useState<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inner.current = node;
      setElement(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  // X para limpar: só em campos de texto editáveis e com conteúdo.
  const enabled = clearable && isClearableType(type) && !rest.disabled && !rest.readOnly;
  const { hasValue, clear } = useClearable(inner, enabled, rest.value);
  const showClear = enabled && hasValue;
  const position = useAnchorPosition(element, showClear && !label);

  if (!label) {
    const kind = type === 'checkbox' || type === 'radio' ? 'choice' : variant;
    const classes = `${controls.control} ${controls[kind]} ${className}`.trim();
    const floating =
      showClear && position ? { left: position.left - 38, top: position.top + (position.height - 28) / 2 } : null;
    return (
      <>
        <input
          ref={setRefs}
          id={id}
          type={type}
          className={classes}
          style={showClear ? { paddingRight: 42, ...style } : style}
          {...rest}
        />
        {floating && <ClearButton onClear={clear} floatingStyle={floating} />}
      </>
    );
  }

  const isPassword = type === 'password';
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.wrapper} ${error ? styles.hasError : ''}`}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          ref={setRefs}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className={`${styles.input} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          style={style}
          {...rest}
        />
        {showClear && <ClearButton onClear={clear} />}
        {isPassword && <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
      </div>
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

// Campos de data e mês abrem o calendário do Pentágono; os demais tipos seguem como campo de texto.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const { type, label, variant: _variant, error: _error, icon: _icon, clearable: _clearable, ...rest } = props;
  if (type === 'date' || type === 'month')
    return <DatePicker ref={ref} type={type as 'date' | 'month'} label={label} {...rest} />;
  return <TextInput ref={ref} {...props} />;
});
