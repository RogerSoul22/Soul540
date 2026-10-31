import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import type { FinanceStatus } from '@soul540/contracts';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';
import { getFinanceModalityLabel } from '../support/finance-modalities';
function formatDate(date: string | undefined | null): string {
  if (!date) return '-';
  try {
    return format(new Date(date + 'T12:00:00'), 'dd/MM/yy', { locale: ptBR });
  } catch {
    return date;
  }
}
function originLabel(entry: { automatic?: boolean; origin?: string }): string {
  if (entry.automatic) return 'Evento automático';
  if (entry.origin === 'factory_order') return 'Pedido da fábrica';
  if (entry.origin === 'bank_import') return 'Extrato OFX';
  return 'Manual';
}
function FinanceEntryActions({
  controller,
  entry,
}: {
  controller: FinanceiroController;
  entry: FinanceiroController['filtered'][number];
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        className={styles.actionBtn}
        onClick={(event) => {
          event.stopPropagation();
          controller.handleFinanceEditAction(entry);
        }}
        title="Editar lançamento"
      >
        Editar
      </button>
      <button
        className={styles.actionBtn + ' ' + styles.actionBtnDanger}
        onClick={(event) => {
          event.stopPropagation();
          controller.requestFinanceDelete(entry);
        }}
        title="Excluir lançamento"
      >
        Excluir
      </button>
    </div>
  );
}
export default function FinanceEntriesTable({ controller }: { controller: FinanceiroController }) {
  const {
    filtered,
    lancamentosPage,
    setLancamentosPage,
    setSelectedFinance,
    categoryLabels,
    categoryColors,
    handleEventFinanceStatus,
  } = controller;
  const pageCount = Math.max(1, Math.ceil(filtered.length / 50));
  const pageItems = filtered.slice((lancamentosPage - 1) * 50, lancamentosPage * 50);
  if (filtered.length === 0) return <div className={styles.emptyState}>Nenhum lançamento encontrado.</div>;
  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Modalidade</th>
              <th>Origem</th>
              <th>Data</th>
              <th>Status</th>
              <th>Valor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((entry) => (
              <tr
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
                <td>{getFinanceModalityLabel(entry.modality)}</td>
                <td>{originLabel(entry)}</td>
                <td>{formatDate(entry.date)}</td>
                <td>
                  <select
                    className={
                      styles.agendamentoStatus +
                      ' ' +
                      (entry.status === 'paid' ? styles.statusReceived : styles.statusPending)
                    }
                    value={entry.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => handleEventFinanceStatus(entry, event.target.value as FinanceStatus)}
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
                  <FinanceEntryActions controller={controller} entry={entry} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 50 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page - 1)}
            disabled={lancamentosPage <= 1}
          >
            ← Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {lancamentosPage} de {pageCount}
            <span className={styles.pageTotal}> · {filtered.length} lançamentos</span>
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setLancamentosPage((page) => page + 1)}
            disabled={lancamentosPage >= pageCount}
          >
            Próxima →
          </button>
        </div>
      )}
    </>
  );
}
