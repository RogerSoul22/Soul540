import { Button, PageHeader } from '../../../pentagono/src/index';
import { useEffect, useState } from 'react';
import { actionColors, actionLabels, resourceLabels, type AuditEntry } from './audit-types';
import AuditLogFilters from './AuditLogFilters';
import AuditLogTable from './AuditLogTable';
export interface AuditLogStyles {
  [className: string]: string;
}
interface AuditLogScreenProps {
  apiFetch(path: string): Promise<Response>;
  csvPrefix: string;
  styles: AuditLogStyles;
  unitLabels: Record<string, string>;
  showUnitFilter?: boolean;
  showSystemColumn?: boolean;
}
export default function AuditLogScreen({
  apiFetch,
  csvPrefix,
  styles,
  unitLabels,
  showUnitFilter = true,
  showSystemColumn = true,
}: AuditLogScreenProps) {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState('');
  const [unit, setUnit] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;
  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (resource) params.set('resource', resource);
    if (unit) params.set('unit', unit);
    setLoading(true);
    apiFetch(`/api/audit-log?${params}`)
      .then((response) => response.json())
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiFetch, page, resource, unit]);
  const totalPages = Math.ceil(total / limit);
  const formatDate = (timestamp: string) =>
    new Date(timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  function exportCsv() {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      [
        'Data/Hora',
        'Usuário',
        ...(showSystemColumn ? ['Sistema'] : []),
        'Ação',
        'Recurso',
        'Descrição',
      ].map(escape).join(';'),
      ...items.map((entry) =>
        [
          formatDate(entry.timestamp),
          entry.userName,
          ...(showSystemColumn ? [unitLabels[entry.userUnit] || entry.userUnit] : []),
          actionLabels[entry.action],
          resourceLabels[entry.resource] || entry.resource,
          entry.description,
        ]
          .map(escape)
          .join(';'),
      ),
    ];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${csvPrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className={styles.page}>
      <PageHeader
        title="Log de Auditoria"
        subtitle={
          <>
            {total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={exportCsv}
              disabled={!items.length}
              title="Exportar página atual em CSV"
            >
              Exportar CSV
            </Button>
          </>
        }
      />
      <AuditLogFilters
        styles={styles}
        unitLabels={unitLabels}
        showUnitFilter={showUnitFilter}
        resource={resource}
        unit={unit}
        onResourceChange={(value) => {
          setResource(value);
          setPage(1);
        }}
        onUnitChange={(value) => {
          setUnit(value);
          setPage(1);
        }}
      />
      <AuditLogTable
        items={items}
        loading={loading}
        styles={styles}
        unitLabels={unitLabels}
        formatDate={formatDate}
        showSystemColumn={showSystemColumn}
      />
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            ← Anterior
          </Button>
          <span className={styles.pageInfo}>
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima →
          </Button>
        </div>
      )}
    </div>
  );
}
