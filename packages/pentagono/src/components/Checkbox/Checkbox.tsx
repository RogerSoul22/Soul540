import styles from './Checkbox.module.css';
import type { CheckboxProps } from './type';

export function Checkbox({ label, description, variant = 'checkbox', className = '', ...rest }: CheckboxProps) {
  return (
    <label className={`${styles.checkbox} ${styles[variant]} ${className}`.trim()}>
      <input type="checkbox" role={variant === 'switch' ? 'switch' : undefined} className={styles.input} {...rest} />
      <span className={styles.text}>
        <span>{label}</span>
        {description && <small className={styles.description}>{description}</small>}
      </span>
    </label>
  );
}
