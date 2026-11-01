import {
  Button,
  EmptyState,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../../../../../packages/pentagono/src/index';
import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Props = { controller: ReturnType<typeof useFinanceiroController> };
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
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
      {filtered.length === 0 ? (
        <EmptyState title="Nenhum lancamento encontrado." />
      ) : (
        <div className={styles.tableWrap}>
          <Table variant="plain" className={styles.table}>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tipo</TableHeadCell>
                <TableHeadCell>Descricao</TableHeadCell>
                <TableHeadCell>Categoria</TableHeadCell>
                <TableHeadCell>Data</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Valor</TableHeadCell>
                <TableHeadCell></TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice((lancamentosPage - 1) * 50, lancamentosPage * 50).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                      {entry.type === 'revenue' ? 'Receita' : 'Custo'}
                    </span>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <span className={styles.categoryTag}>
                      <span
                        className={styles.categoryDot}
                        style={{ background: categoryColors[entry.category] || '#64748b' }}
                      />
                      {categoryLabels[entry.category] || entry.category}
                    </span>
                  </TableCell>
                  <TableCell>{safeFormat(entry.date, 'dd/MM/yy')}</TableCell>
                  <TableCell>
                    <Select
                      variant="compact"
                      className={[
                        styles.agendamentoStatus,
                        entry.status === 'paid' ? styles.statusReceived : styles.statusPending,
                      ].join(' ')}
                      value={entry.status}
                      onChange={(e) => handleEventFinanceStatus(entry, e.target.value as FinanceStatus)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                      {entry.type === 'revenue' ? '+' : '-'} {formatBRL(entry.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button
                        variant="outline"
                        className={styles.actionBtn}
                        onClick={() => handleEdit(entry)}
                        title="Editar"
                      >
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
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
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
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {filtered.length > 50 && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page - 1)}
            disabled={lancamentosPage <= 1}
          >
            Anterior
          </Button>
          <span className={styles.pageInfo}>
            Pagina {lancamentosPage} de {Math.ceil(filtered.length / 50)}
            <span className={styles.pageTotal}>{filtered.length} lancamentos</span>
          </span>
          <Button
            variant="outline"
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page + 1)}
            disabled={lancamentosPage >= Math.ceil(filtered.length / 50)}
          >
            Proxima
          </Button>
        </div>
      )}
    </>
  );
}
