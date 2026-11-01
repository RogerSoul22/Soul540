import { Card } from '../../../../../../packages/pentagono/src/index';
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
    insumosRatio,
    maoObraRatio,
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
            <Card className={styles.gaugeCard}>
              <GaugeChart
                label="Lucro"
                value={monthMargin}
                max={100}
                suffix="%"
                color={monthMargin >= 20 ? '#4ade80' : monthMargin >= 10 ? '#fbbf24' : '#f87171'}
              />
            </Card>
            <Card className={styles.gaugeCard}>
              <GaugeChart
                label="Insumos"
                value={insumosRatio}
                max={100}
                suffix="%"
                color={insumosRatio <= 30 ? '#4ade80' : insumosRatio <= 45 ? '#fbbf24' : '#f87171'}
              />
            </Card>
            <Card className={styles.gaugeCard}>
              <GaugeChart
                label="Mao de Obra"
                value={maoObraRatio}
                max={100}
                suffix="%"
                color={maoObraRatio <= 25 ? '#4ade80' : maoObraRatio <= 40 ? '#fbbf24' : '#f87171'}
              />
            </Card>
          </div>

          {/* Horizontal bars */}
          <div className={styles.barsGrid}>
            <Card className={styles.barCard}>
              <HorizontalBarChart title="Despesas Variaveis" items={variableCosts} formatValue={formatBRL} />
            </Card>
            <Card className={styles.barCard}>
              <HorizontalBarChart title="Despesas Fixas" items={fixedCosts} formatValue={formatBRL} />
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: LANCAMENTOS ===== */}
    </>
  );
}
