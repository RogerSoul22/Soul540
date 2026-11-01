import { forwardRef } from 'react';
import styles from './Label.module.css';
import type { LabelProps } from './type';

// Rótulo de uso livre (envolve checkbox, botão de arquivo etc.). Campos com rótulo usam Input/Select/Textarea.
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { children, className = '', ...rest },
  ref,
) {
  return (
    <label ref={ref} className={`${styles.label} ${className}`} {...rest}>
      {children}
    </label>
  );
});
