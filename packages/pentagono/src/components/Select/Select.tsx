import { forwardRef } from 'react';
import styles from './Select.module.css';
import type { SelectProps } from './type';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, id, variant = 'default', className = '', children, ...rest },
  ref,
) {
  if (!label) {
    return (
      <select ref={ref} id={id} className={`${styles.select} ${styles[variant]} ${className}`.trim()} {...rest}>
        {children}
      </select>
    );
  }

  const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className={styles.field}>
      <label htmlFor={selectId}>{label}</label>
      <select ref={ref} id={selectId} className={`${styles.select} ${styles[variant]} ${className}`.trim()} {...rest}>
        {children}
      </select>
    </div>
  );
});
