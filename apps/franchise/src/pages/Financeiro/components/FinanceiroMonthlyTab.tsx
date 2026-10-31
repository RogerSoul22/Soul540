import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { GaugeChart } from '../../../../../../packages/ui/src/index';
import { HorizontalBarChart } from '../../../../../../packages/ui/src/index';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceiroMonthlyTab({ controller }: Props) {
  const {
    activeTab,
    monthRevenue,
    monthCosts,
    monthProfit,
    monthMargin,
    insumosRatioMensal,
    maoObraRatioMensal,
    fixedCosts,
    variableCosts,
  } = controller;
  return (
    <>
      {activeTab === 'mensal' && (
        <div className={styles.tabContent}>
          {/* Period summary bar */}
          <div className={styles.monthSummary}>
            <div className={`${styles.monthSummaryItem} ${styles.monthRevenue}`}>
              <span className={styles.monthSummaryLabel}>Receita</span>
              <span className={styles.monthSummaryValue}>{formatBRL(monthRevenue)}</span>
            </div>
            <div className={styles.monthSummaryOperator}>-</div>
            <div className={`${styles.monthSummaryItem} ${styles.monthExpense}`}>
              <span className={styles.monthSummaryLabel}>Despesas</span>
              <span className={styles.monthSummaryValue}>{formatBRL(monthCosts)}</span>
            </div>
            <div className={styles.monthSummaryOperator}>=</div>
            <div className={`${styles.monthSummaryItem} ${monthProfit >= 0 ? styles.monthProfit : styles.monthLoss}`}>
              <span className={styles.monthSummaryLabel}>{monthProfit >= 0 ? 'Lucro' : 'Prejuizo'}</span>
              <span className={styles.monthSummaryValue}>{formatBRL(Math.abs(monthProfit))}</span>
            </div>
          </div>

          {/* Gauges row */}
          <div className={styles.gaugesGrid}>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Lucro"
                value={monthMargin}
                max={100}
                suffix="%"
                color={monthMargin >= 20 ? '#4ade80' : monthMargin >= 10 ? '#fbbf24' : '#f87171'}
              />
            </div>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Insumos"
                value={insumosRatioMensal}
                max={100}
                suffix="%"
                color={insumosRatioMensal <= 30 ? '#4ade80' : insumosRatioMensal <= 45 ? '#fbbf24' : '#f87171'}
              />
            </div>
            <div className={styles.gaugeCard}>
              <GaugeChart
                label="Mao de Obra"
                value={maoObraRatioMensal}
                max={100}
                suffix="%"
                color={maoObraRatioMensal <= 25 ? '#4ade80' : maoObraRatioMensal <= 40 ? '#fbbf24' : '#f87171'}
              />
            </div>
          </div>

          {/* Horizontal bars */}
          <div className={styles.barsGrid}>
            <div className={styles.barCard}>
              <HorizontalBarChart title="Despesas Variaveis" items={variableCosts} formatValue={formatBRL} />
            </div>
            <div className={styles.barCard}>
              <HorizontalBarChart title="Despesas Fixas" items={fixedCosts} formatValue={formatBRL} />
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: ESTIMADO x FINAL ===== */}
    </>
  );
}
