import type { FinanceEntry } from '../../../../../../packages/contracts/src/index';
import { FIXED_CATEGORIES, VARIABLE_CATEGORIES } from '../../../../../../shared/finance/financeCategories';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';

type CostFilter = 'all' | 'fixed' | 'variable';

type FinanceExpensesTabProps = {
  costFilter: CostFilter;
  setCostFilter: (value: CostFilter) => void;
  periodFinances: FinanceEntry[];
  categoryLabels: Record<string, string>;
  categoryColors: Record<string, string>;
};

export default function FinanceExpensesTab({
  costFilter,
  setCostFilter,
  periodFinances,
  categoryLabels,
  categoryColors,
}: FinanceExpensesTabProps) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          {(['all', 'fixed', 'variable'] as CostFilter[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${costFilter === f ? styles.filterBtnActive : ''}`}
              onClick={() => setCostFilter(f)}
            >
              {f === 'all' ? 'Todas' : f === 'fixed' ? 'Fixas' : 'Variaveis'}
            </button>
          ))}
        </div>
      </div>

      {/* Category totals list */}
      <div className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Total por Categoria</h3>
        {(() => {
          const cats =
            costFilter === 'fixed'
              ? [...FIXED_CATEGORIES]
              : costFilter === 'variable'
                ? [...VARIABLE_CATEGORIES]
                : [...FIXED_CATEGORIES, ...VARIABLE_CATEGORIES];
          const totals = cats
            .map((cat) => ({
              cat,
              total: periodFinances
                .filter((f) => f.type === 'cost' && f.category === cat)
                .reduce((a, f) => a + f.amount, 0),
            }))
            .filter(({ total }) => total > 0)
            .sort((a, b) => b.total - a.total);
          const max = totals[0]?.total || 1;
          if (totals.length === 0)
            return (
              <div className={styles.emptyStateBox}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: '#64748b', marginBottom: 8 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className={styles.emptyStateTitle}>Nenhuma despesa no período selecionado.</p>
                <p className={styles.emptyStateHint}>
                  Registre despesas clicando em <strong>+ Novo Lançamento</strong> e escolhendo o tipo{' '}
                  <strong>Custo</strong>.
                </p>
              </div>
            );
          return (
            <div className={styles.catList}>
              {totals.map(({ cat, total }) => (
                <div key={cat} className={styles.catRow}>
                  <span className={styles.catDot} style={{ background: categoryColors[cat] || '#64748b' }} />
                  <span className={styles.catName}>{categoryLabels[cat] || cat}</span>
                  <div className={styles.catBarWrap}>
                    <div
                      className={styles.catBar}
                      style={{
                        width: `${(total / max) * 100}%`,
                        background: categoryColors[cat] || '#64748b',
                      }}
                    />
                  </div>
                  <span className={styles.catValue}>{formatBRL(total)}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
