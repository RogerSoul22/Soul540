import { useEffect, useState } from 'react';
import { apiFetch } from '@frontend/lib/api';
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
  users: 'Usuários',
  invoices: 'Notas Fiscais',
};

const UNIT_LABELS: Record<string, string> = {
  main: 'Principal',
  franchise: 'Franquia',
  factory: 'Fábrica',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Log de Auditoria</h1>
          <p className={styles.subtitle}>{total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.select}
          value={resource}
          onChange={e => { setResource(e.target.value); setPage(1); }}
        >
          <option value="">Todos os recursos</option>
          {Object.entries(RESOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className={styles.select}
          value={unit}
          onChange={e => { setUnit(e.target.value); setPage(1); }}
        >
          <option value="">Todos os sistemas</option>
          {Object.entries(UNIT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
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
                <th>Usuário</th>
                <th>Sistema</th>
                <th>Ação</th>
                <th>Recurso</th>
                <th>Descrição</th>
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
          <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            ← Anterior
          </button>
          <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
          <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
