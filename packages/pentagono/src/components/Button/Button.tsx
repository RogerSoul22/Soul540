import { forwardRef } from 'react';
import styles from './Button.module.css';
import variants from './Button.variants.module.css';
import { SIZED_VARIANTS, type ButtonProps } from './type';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    active = false,
    disabled,
    className = '',
    ...rest
  },
  ref,
) {
  const sized = SIZED_VARIANTS.includes(variant);
  const classes = [
    styles.button,
    sized ? styles[variant] : variants[variant],
    sized ? styles[size] : '',
    active ? variants.active : '',
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-pressed={active && (variant === 'chip' || variant === 'outline') ? true : undefined}
      aria-current={active && (variant === 'nav' || variant === 'tab') ? 'true' : undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : children}
    </button>
  );
});
