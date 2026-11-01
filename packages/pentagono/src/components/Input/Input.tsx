import { forwardRef, useState } from 'react';
import controls from './Input.controls.module.css';
import styles from './Input.module.css';
import type { InputProps } from './type';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, variant = 'default', type = 'text', id, className = '', ...rest },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  if (!label) {
    const kind = type === 'checkbox' || type === 'radio' ? 'choice' : variant;
    const classes = `${controls.control} ${controls[kind]} ${className}`.trim();
    return <input ref={ref} id={id} type={type} className={classes} {...rest} />;
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
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className={`${styles.input} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
