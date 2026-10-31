import type { useFinanceiroController } from '../hooks/use-financeiro-controller';
type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { Badge } from '@soul540/ui';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import styles from '../styles/Financeiro.module.scss';
import { getFinanceModalityLabel } from '../support/finance-modalities';
type FinanceStatus = 'pending' | 'paid';
const statusLabels: Record<FinanceStatus, string> = { pending: 'Pendente', paid: 'Pago' };
const statusColors: Record<FinanceStatus, 'amber' | 'green'> = { pending: 'amber', paid: 'green' };
export default function FinanceiroEntriesTable({ controller }: Props) {
  const {
    categoryLabels,
    categoryColors,
    filtered,
    lancamentosPage,
    setLancamentosPage,
    openEditFinance,
    deleteFinance,
    safeFormatDate,
  } = controller;
  return (
    <>
      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>Nenhum lançamento encontrado.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Modalidade</th>
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
                  <td>{getFinanceModalityLabel(entry.modality)}</td>
                  <td>{entry.description}</td>
                  <td>
                    <span className={styles.categoryTag}>
                      <span
                        className={styles.categoryDot}
                        style={{
                          background: categoryColors[entry.category] || '#64748b',
                        }}
                      />
                      {categoryLabels[entry.category] || entry.category}
                    </span>
                  </td>
                  <td>{safeFormatDate(entry.date, 'dd/MM/yy', { locale: ptBR })}</td>
                  <td>
                    <Badge variant={statusColors[entry.status as FinanceStatus] ?? 'amber'}>
                      {statusLabels[entry.status as FinanceStatus] ?? entry.status}
                    </Badge>
                  </td>
                  <td>
                    <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                      {entry.type === 'revenue' ? '+' : '-'} {formatBRL(entry.amount)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className={styles.actionBtn} onClick={() => openEditFinance(entry)} title="Editar">
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {lancamentosPage} de {Math.ceil(filtered.length / 50)}
            <span className={styles.pageTotal}> · {filtered.length} lançamentos</span>
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page + 1)}
            disabled={lancamentosPage >= Math.ceil(filtered.length / 50)}
          >
            Próxima
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
