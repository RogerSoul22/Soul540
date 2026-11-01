import styles from './Card.module.css';
import type { CardProps } from './type';

export function Card({ children, className, variant = 'default', interactive = false, ...rest }: CardProps) {
  const classes = [styles.card, styles[variant], interactive ? styles.interactive : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-interactive={interactive || undefined} {...rest}>
      {children}
    </div>
  );
}
