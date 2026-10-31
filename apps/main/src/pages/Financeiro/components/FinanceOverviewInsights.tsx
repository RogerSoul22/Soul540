import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

function Ranking({
  title,
  items,
  label,
  total,
}: {
  title: string;
  items: Array<{ label: string; amount: number }>;
  label: (item: { label: string; amount: number }) => string;
  total: number;
}) {
  return (
    <div className={styles.agendamentosCard}>
      <div className={styles.agendamentosHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <strong>{formatBRL(total)}</strong>
      </div>
      {!items.length ? (
        <p className={styles.agendamentosEmpty}>Nenhum registro no período.</p>
      ) : (
        <div className={styles.financeRankingList}>
          {items.slice(0, 8).map((item) => (
            <div key={label(item)} className={styles.financeRankingItem}>
              <div>
                <span>{label(item)}</span>
                <strong>{formatBRL(item.amount)}</strong>
              </div>
              <div className={styles.financeRankingTrack}>
                <span
                  className={styles.financeRankingFill}
                  style={{ width: (item.amount / (total || 1)) * 100 + '%' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FinanceOverviewInsights({ controller }: { controller: FinanceiroController }) {
  const { expenseCategorySummary, revenueByEvent, revenueByOrigin, commissionSummary, categoryLabels } = controller;
  const expenseItems = expenseCategorySummary.map((item) => ({
    label: categoryLabels[item.category] || item.category,
    amount: item.amount,
  }));
  const eventItems = revenueByEvent.map((item) => ({ label: item.name, amount: item.amount }));
  const originItems = revenueByOrigin.map((item) => ({
    label: item.origin === 'bank_import' ? 'Extrato OFX' : item.origin,
    amount: item.amount,
  }));
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const totalEvents = eventItems.reduce((sum, item) => sum + item.amount, 0);
  const totalOrigins = originItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <div className={styles.financeInsightsGrid}>
        <Ranking
          title="Despesas por categoria"
          items={expenseItems}
          label={(item) => item.label}
          total={totalExpenses}
        />
        <Ranking title="Receitas por evento" items={eventItems} label={(item) => item.label} total={totalEvents} />
        <Ranking title="Origem do faturamento" items={originItems} label={(item) => item.label} total={totalOrigins} />
      </div>
      {commissionSummary.length > 0 && (
        <div className={styles.agendamentosCard + ' ' + styles.commissionSection}>
          <div className={styles.agendamentosHeader}>
            <h3 className={styles.sectionTitle}>Comissões</h3>
            <strong>{formatBRL(commissionSummary.reduce((sum, item) => sum + item.amount, 0))}</strong>
          </div>
          <div className={styles.commissionGrid}>
            {commissionSummary.slice(0, 12).map((item) => (
              <div key={item.id} className={styles.commissionItem}>
                <span>{item.description}</span>
                <strong>{formatBRL(item.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
