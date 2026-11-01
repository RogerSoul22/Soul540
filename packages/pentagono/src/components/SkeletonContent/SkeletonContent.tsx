import { VisuallyHidden } from '../../accessibility/VisuallyHidden';
import styles from './SkeletonContent.module.css';

export type SkeletonContentVariant = 'page' | 'cards' | 'table' | 'list';

export interface SkeletonContentProps {
  variant?: SkeletonContentVariant;
  count?: number;
  label?: string;
  className?: string;
}

const DEFAULT_COUNT: Record<SkeletonContentVariant, number> = { page: 4, cards: 4, table: 6, list: 3 };

export function SkeletonContent({ variant = 'page', count, label = 'Carregando...', className }: SkeletonContentProps) {
  const repeat = (name: string) =>
    Array.from({ length: count ?? DEFAULT_COUNT[variant] }, (_, i) => (
      <div key={i} className={name} data-skeleton="true" />
    ));

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} role="status" aria-busy="true">
      <VisuallyHidden>{label}</VisuallyHidden>
      {variant === 'page' && (
        <>
          <div className={styles.title} data-skeleton="true" />
          <div className={styles.cards}>{repeat(styles.card)}</div>
          <div className={styles.block} data-skeleton="true" />
        </>
      )}
      {variant === 'cards' && <div className={styles.cards}>{repeat(styles.card)}</div>}
      {variant === 'table' && (
        <>
          <div className={styles.header} data-skeleton="true" />
          {repeat(styles.row)}
        </>
      )}
      {variant === 'list' && repeat(styles.item)}
    </div>
  );
}
