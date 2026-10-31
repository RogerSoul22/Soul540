import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import styles from '../styles/Financeiro.module.scss';

type FinanceStatus = 'pending' | 'paid';
function safeFormat(date: string | undefined | null, fmt: string) {
  if (!date) return '—';
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, fmt, { locale: ptBR }) : '—';
}

export default function FinanceiroEntriesTable({ controller }: Props) {
  const {
    categoryLabels,
    categoryColors,
    filtered,
    lancamentosPage,
    setLancamentosPage,
    handleEventFinanceStatus,
    deleteFinance,
    handleEdit,
  } = controller;
  return (
    <>
      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>Nenhum lancamento encontrado.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descricao</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>Status</th>
                <th>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((lancamentosPage - 1) * 50, lancamentosPage * 50).map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                      {entry.type === 'revenue' ? 'Receita' : 'Custo'}
                    </span>
                  </td>
                  <td>{entry.description}</td>
                  <td>
                    <span className={styles.categoryTag}>
                      <span
                        className={styles.categoryDot}
                        style={{ background: categoryColors[entry.category] || '#64748b' }}
                      />
                      {categoryLabels[entry.category] || entry.category}
                    </span>
                  </td>
                  <td>{safeFormat(entry.date, 'dd/MM/yy')}</td>
                  <td>
                    <select
                      className={[
                        styles.agendamentoStatus,
                        entry.status === 'paid' ? styles.statusReceived : styles.statusPending,
                      ].join(' ')}
                      value={entry.status}
                      onChange={(e) => handleEventFinanceStatus(entry, e.target.value as FinanceStatus)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </select>
                  </td>
                  <td>
                    <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                      {entry.type === 'revenue' ? '+' : '-'} {formatBRL(entry.amount)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className={styles.actionBtn} onClick={() => handleEdit(entry)} title="Editar">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => deleteFinance(entry.id)}
                        title="Excluir"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length > 50 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page - 1)}
            disabled={lancamentosPage <= 1}
          >
            Anterior
          </button>
          <span className={styles.pageInfo}>
            Pagina {lancamentosPage} de {Math.ceil(filtered.length / 50)}
            <span className={styles.pageTotal}>{filtered.length} lancamentos</span>
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page + 1)}
            disabled={lancamentosPage >= Math.ceil(filtered.length / 50)}
          >
            Proxima
          </button>
        </div>
      )}
    </>
  );
}
