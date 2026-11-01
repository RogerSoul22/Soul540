import styles from './Table.module.css';
import type { TableCellProps, TableHeadCellProps, TableProps, TableRowProps, TableSectionProps } from './type';

const join = (...names: Array<string | undefined | false>) => names.filter(Boolean).join(' ') || undefined;

export function Table({ children, className, variant = 'scroll', ...rest }: TableProps) {
  const table = (
    <table className={join(styles.table, variant === 'compact' && styles.compact, className)} {...rest}>
      {children}
    </table>
  );
  return variant === 'plain' ? table : <div className={styles.wrap}>{table}</div>;
}

export function TableHead({ children, className, ...rest }: TableSectionProps) {
  return (
    <thead className={join(styles.head, className)} {...rest}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...rest }: TableSectionProps) {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, interactive = false, ...rest }: TableRowProps) {
  return (
    <tr className={join(styles.row, interactive && styles.interactive, className)} {...rest}>
      {children}
    </tr>
  );
}

export function TableHeadCell({ children, className, ...rest }: TableHeadCellProps) {
  return (
    <th className={join(styles.headCell, className)} {...rest}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...rest }: TableCellProps) {
  return (
    <td className={join(styles.cell, className)} {...rest}>
      {children}
    </td>
  );
}
