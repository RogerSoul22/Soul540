import type { SelectHTMLAttributes } from 'react';
import styles from './styles/Select.module.scss';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export default function Select({ label, id, className = '', children, ...rest }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className={styles.field}>
      {label ? <label htmlFor={selectId}>{label}</label> : null}
      <select id={selectId} className={`${styles.select} ${className}`} {...rest}>
        {children}
      </select>
    </div>
  );
}
