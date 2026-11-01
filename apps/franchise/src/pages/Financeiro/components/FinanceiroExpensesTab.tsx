import { Button, EmptyState, Heading } from '../../../../../../packages/pentagono/src/index';
import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { FIXED_CATEGORIES, VARIABLE_CATEGORIES } from '../../../../../../shared/finance/financeCategories';
import { compareTextPtBr as compareAlpha } from '../../../../../../packages/domain/src/index';
import type { CostFilter } from '../types/finance-controller-types';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceiroExpensesTab({ controller }: Props) {
  const { activeTab, costFilter, setCostFilter, periodFinances, categoryLabels, categoryColors } = controller;
  return (
    <>
      {activeTab === 'despesas' && (
        <div className={styles.tabContent}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              {(['all', 'fixed', 'variable'] as CostFilter[]).map((f) => (
                <Button
                  variant="chip"
                  key={f}
                  className={`${styles.filterBtn} ${costFilter === f ? styles.filterBtnActive : ''}`}
                  onClick={() => setCostFilter(f)}
                >
                  {f === 'all' ? 'Todas' : f === 'fixed' ? 'Fixas' : 'Variaveis'}
                </Button>
              ))}
            </div>
          </div>

          {/* Category totals list */}
          <div className={styles.chartSection}>
            <Heading level={3} variant="section" className={styles.sectionTitle}>
              Total por Categoria
            </Heading>
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
                .sort((a, b) => compareAlpha(categoryLabels[a.cat] || a.cat, categoryLabels[b.cat] || b.cat));
              const max = totals[0]?.total || 1;
              if (totals.length === 0)
                return (
                  <EmptyState variant="compact" title="Nenhuma despesa registrada." className={styles.emptyState} />
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
      )}

      {/* ===== TAB: PAINEL DO PERÍODO ===== */}
    </>
  );
}
