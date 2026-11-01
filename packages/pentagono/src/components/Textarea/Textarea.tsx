import { forwardRef } from 'react';
import styles from './Textarea.module.css';
import type { TextareaProps } from './type';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, rows = 4, className = '', ...rest },
  ref,
) {
  if (!label) {
    return <textarea ref={ref} id={id} rows={rows} className={`${styles.textarea} ${className}`.trim()} {...rest} />;
  }

  const textareaId = id || label.toLowerCase().replace(/\s/g, '-');
  const errorId = `${textareaId}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={textareaId} className={styles.label}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.hasError : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
