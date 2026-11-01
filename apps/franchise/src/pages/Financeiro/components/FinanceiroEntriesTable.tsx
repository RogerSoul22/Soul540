import type { useFinanceiroController } from '../hooks/use-financeiro-controller';
type Props = { controller: ReturnType<typeof useFinanceiroController> };
import {
  Badge,
  Button,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../../../../../packages/pentagono/src/index';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';
import { getFinanceModalityLabel } from '../support/finance-modalities';
import FinanceiroEntryActions from './FinanceiroEntryActions';
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
        <EmptyState title="Nenhum lançamento encontrado." />
      ) : (
        <div className={styles.tableWrap}>
          <Table variant="plain" className={styles.table}>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tipo</TableHeadCell>
                <TableHeadCell>Descrição</TableHeadCell>
                <TableHeadCell>Categoria</TableHeadCell>
                <TableHeadCell>Modalidade</TableHeadCell>
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
                  <TableCell>{getFinanceModalityLabel(entry.modality)}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <span className={styles.categoryTag}>
                      <span
                        className={styles.categoryDot}
                        style={{
                          background: categoryColors[entry.category] || '#64748b',
                        }}
                      />
                      {categoryLabels[entry.category] || entry.category}
                    </span>
                  </TableCell>
                  <TableCell>{safeFormatDate(entry.date, 'dd/MM/yy', { locale: ptBR })}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[entry.status as FinanceStatus] ?? 'amber'}>
                      {statusLabels[entry.status as FinanceStatus] ?? entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                      {entry.type === 'revenue' ? '+' : '-'} {formatBRL(entry.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <FinanceiroEntryActions entry={entry} onEdit={openEditFinance} onDelete={deleteFinance} />
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
          </Button>
          <span className={styles.pageInfo}>
            Página {lancamentosPage} de {Math.ceil(filtered.length / 50)}
            <span className={styles.pageTotal}> · {filtered.length} lançamentos</span>
          </span>
          <Button
            variant="outline"
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
          </Button>
        </div>
      )}
    </>
  );
}
