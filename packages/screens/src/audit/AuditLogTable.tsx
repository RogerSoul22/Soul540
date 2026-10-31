import { actionColors, actionLabels, resourceLabels, type AuditEntry } from './audit-types';
import type { AuditLogStyles } from './AuditLogScreen';

type Props = {
  items: AuditEntry[];
  loading: boolean;
  styles: AuditLogStyles;
  unitLabels: Record<string, string>;
  formatDate: (value: string) => string;
};

export default function AuditLogTable({ items, loading, styles, unitLabels, formatDate }: Props) {
  return (
    <div className={styles.tableWrap}>
      {loading ? (
        <div className={styles.empty}>Carregando...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>Nenhum registro encontrado.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Sistema</th>
              <th>Ação</th>
              <th>Recurso</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.id}>
                <td className={styles.mono}>{formatDate(entry.timestamp)}</td>
                <td>{entry.userName}</td>
                <td>{unitLabels[entry.userUnit] || entry.userUnit}</td>
                <td>
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
                </td>
                <td>{resourceLabels[entry.resource] || entry.resource}</td>
                <td className={styles.desc}>{entry.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
