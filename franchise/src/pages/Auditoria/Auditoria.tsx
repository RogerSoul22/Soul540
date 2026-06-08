import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import styles from './Auditoria.module.scss';

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userUnit: string;
  action: 'create' | 'update' | 'delete';
  resource: string;
  resourceId: string;
  description: string;
  timestamp: string;
}

const RESOURCE_LABELS: Record<string, string> = {
  finances: 'Financeiro',
  events: 'Eventos',
  users: 'Usuarios',
  invoices: 'Notas Fiscais',
  contractors: 'Contratantes',
  contracts: 'Contratos',
  menus: 'Cardapios',
};

const UNIT_LABELS: Record<string, string> = {
  main: 'Principal',
  franchise: 'Campinas',
  factory: 'Fabrica',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Criacao',
  update: 'Atualizacao',
  delete: 'Exclusao',
};

const ACTION_COLORS: Record<string, string> = {
  create: '#34d399',
  update: '#f59e0b',
  delete: '#f87171',
};

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Auditoria() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState('');
  const [unit, setUnit] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (resource) params.set('resource', resource);
    if (unit) params.set('unit', unit);
    apiFetch(`/api/audit-log?${params}`)
      .then(r => r.json())
      .then(data => { setItems(data.items || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resource, unit, page]);

  const totalPages = Math.ceil(total / limit);

  const exportCSV = () => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      ['Data/Hora', 'Usuario', 'Sistema', 'Acao', 'Recurso', 'Descricao'].map(escape).join(';'),
      ...items.map((entry) => [
        formatDate(entry.timestamp),
        entry.userName,
        UNIT_LABELS[entry.userUnit] || entry.userUnit,
        ACTION_LABELS[entry.action] || entry.action,
        RESOURCE_LABELS[entry.resource] || entry.resource,
        entry.description,
      ].map(escape).join(';')),
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-campinas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Log de Auditoria</h1>
          <p className={styles.subtitle}>{total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.btnExport} onClick={exportCSV} disabled={items.length === 0} title="Exportar pagina atual em CSV">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar CSV
        </button>
      </div>

      <div className={styles.filters}>
        <select className={styles.select} value={resource} onChange={e => { setResource(e.target.value); setPage(1); }}>
          <option value="">Todos os recursos</option>
          {Object.entries(RESOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={styles.select} value={unit} onChange={e => { setUnit(e.target.value); setPage(1); }}>
          <option value="">Todos os sistemas</option>
          {Object.entries(UNIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

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
                <th>Usuario</th>
                <th>Sistema</th>
                <th>Acao</th>
                <th>Recurso</th>
                <th>Descricao</th>
              </tr>
            </thead>
            <tbody>
              {items.map(entry => (
                <tr key={entry.id}>
                  <td className={styles.mono}>{formatDate(entry.timestamp)}</td>
                  <td>{entry.userName}</td>
                  <td>{UNIT_LABELS[entry.userUnit] || entry.userUnit}</td>
                  <td>
                    <span
                      className={styles.badge}
                      style={{ color: ACTION_COLORS[entry.action], borderColor: ACTION_COLORS[entry.action] + '40', background: ACTION_COLORS[entry.action] + '18' }}
                    >
                      {ACTION_LABELS[entry.action] || entry.action}
                    </span>
                  </td>
                  <td>{RESOURCE_LABELS[entry.resource] || entry.resource}</td>
                  <td className={styles.desc}>{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
          <span className={styles.pageInfo}>Pagina {page} de {totalPages}</span>
          <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Proxima</button>
        </div>
      )}
    </div>
  );
}
