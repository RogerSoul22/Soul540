import {
  EmptyState,
  SkeletonContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../../pentagono/src/index';
import { actionColors, actionLabels, resourceLabels, type AuditEntry } from './audit-types';
import type { AuditLogStyles } from './AuditLogScreen';

type Props = {
  items: AuditEntry[];
  loading: boolean;
  styles: AuditLogStyles;
  unitLabels: Record<string, string>;
  formatDate: (value: string) => string;
  showSystemColumn: boolean;
};

export default function AuditLogTable({
  items,
  loading,
  styles,
  unitLabels,
  formatDate,
  showSystemColumn,
}: Props) {
  return (
    <div className={styles.tableWrap}>
      {loading ? (
        <SkeletonContent variant="table" label="Carregando registros..." />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum registro encontrado." />
      ) : (
        <Table variant="plain" className={styles.table}>
          <TableHead>
            <TableRow>
              <TableHeadCell>Data/Hora</TableHeadCell>
              <TableHeadCell>Usuário</TableHeadCell>
              {showSystemColumn && <TableHeadCell>Sistema</TableHeadCell>}
              <TableHeadCell>Ação</TableHeadCell>
              <TableHeadCell>Recurso</TableHeadCell>
              <TableHeadCell>Descrição</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className={styles.mono}>{formatDate(entry.timestamp)}</TableCell>
                <TableCell>{entry.userName}</TableCell>
                {showSystemColumn && <TableCell>{unitLabels[entry.userUnit] || entry.userUnit}</TableCell>}
                <TableCell>
                  <span
                    className={styles.badge}
                    style={{
                      color: actionColors[entry.action],
                      borderColor: `${actionColors[entry.action]}40`,
                      background: `${actionColors[entry.action]}18`,
                    }}
                  >
                    {actionLabels[entry.action]}
                  </span>
                </TableCell>
                <TableCell>{resourceLabels[entry.resource] || entry.resource}</TableCell>
                <TableCell className={styles.desc}>{entry.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
