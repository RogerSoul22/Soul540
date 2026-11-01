import type { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

// scroll: tabela dentro de um invólucro com rolagem horizontal; compact: o mesmo, com células mais
// densas; plain: só a <table>, para quando o contêiner da página já cuida da rolagem.
export type TableVariant = 'scroll' | 'compact' | 'plain';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children?: ReactNode;
  variant?: TableVariant;
}

export interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children?: ReactNode;
  interactive?: boolean;
}

export type TableHeadCellProps = ThHTMLAttributes<HTMLTableCellElement>;
export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;
