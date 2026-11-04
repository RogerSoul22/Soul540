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
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import type { FinanceStatus } from '../../../../../../packages/contracts/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';
import { getFinanceModalityLabel } from '../support/finance-modalities';
import { FinanceEntryActions, formatDate, originLabel } from './FinanceEntryActions';
export default function FinanceEntriesTable({ controller }: { controller: FinanceiroController }) {
  const {
    filtered,
    lancamentosPage,
    setLancamentosPage,
    setSelectedFinance,
    categoryLabels,
    categoryColors,
    handleEventFinanceStatus,
    canEditEntries,
  } = controller;
  const pageCount = Math.max(1, Math.ceil(filtered.length / 50));
  const pageItems = filtered.slice((lancamentosPage - 1) * 50, lancamentosPage * 50);
  if (filtered.length === 0) return <EmptyState title="Nenhum lançamento encontrado." />;
  return (
    <>
      <div className={styles.tableWrap}>
        <Table variant="plain" className={styles.table}>
          <TableHead>
            <TableRow>
              <TableHeadCell>Tipo</TableHeadCell>
              <TableHeadCell>Descrição</TableHeadCell>
              <TableHeadCell>Categoria</TableHeadCell>
              <TableHeadCell>Modalidade</TableHeadCell>
              <TableHeadCell>Origem</TableHeadCell>
              <TableHeadCell>Data</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Valor</TableHeadCell>
              <TableHeadCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map((entry) => (
              <TableRow
                key={entry.id}
                className={styles.clickableRow}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFinance(entry)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedFinance(entry);
                  }
                }}
              >
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
                <TableCell>{getFinanceModalityLabel(entry.modality)}</TableCell>
                <TableCell>{originLabel(entry)}</TableCell>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>
                  {canEditEntries ? (
                    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                      <Select
                        variant="compact"
                        className={
                          styles.agendamentoStatus +
                          ' ' +
                          (entry.status === 'paid' ? styles.statusReceived : styles.statusPending)
                        }
                        value={entry.status}
                        onChange={(event) => handleEventFinanceStatus(entry, event.target.value as FinanceStatus)}
                      >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                      </Select>
                    </div>
                  ) : (
                    <span>{entry.status === 'paid' ? 'Pago' : 'Pendente'}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={entry.type === 'revenue' ? styles.typeRevenue : styles.typeCost}>
                    {entry.type === 'revenue' ? '+' : '-'} {formatBRL(entry.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <FinanceEntryActions controller={controller} entry={entry} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filtered.length > 50 && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page - 1)}
            disabled={lancamentosPage <= 1}
          >
            ← Anterior
          </Button>
          <span className={styles.pageInfo}>
            Página {lancamentosPage} de {pageCount}
            <span className={styles.pageTotal}> · {filtered.length} lançamentos</span>
          </span>
          <Button
            variant="outline"
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page + 1)}
            disabled={lancamentosPage >= pageCount}
          >
            Próxima →
          </Button>
        </div>
      )}
    </>
  );
}
