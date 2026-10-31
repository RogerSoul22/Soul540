import type { FinanceEntry } from '@soul540/contracts';
import { GaugeChart } from '@soul540/ui';
import { HorizontalBarChart } from '@soul540/ui';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import styles from '../styles/Financeiro.module.scss';

type CostSummary = Array<{ label: string; value: number; color: string }>;

type FinanceMonthlyTabProps = {
  monthRevenue: number;
  monthCosts: number;
  monthProfit: number;
  monthMargin: number;
  insumosRatioMensal: number;
  maoObraRatioMensal: number;
  variableCosts: CostSummary;
  fixedCosts: CostSummary;
};

export default function FinanceMonthlyTab({
  monthRevenue,
  monthCosts,
  monthProfit,
  monthMargin,
  insumosRatioMensal,
  maoObraRatioMensal,
  variableCosts,
  fixedCosts,
}: FinanceMonthlyTabProps) {
  return (
    <div className={styles.tabContent}>
      {/* Period summary bar */}
      <div className={styles.monthSummary}>
        <div className={`${styles.monthSummaryItem} ${styles.monthRevenue}`}>
          <span className={styles.monthSummaryLabel}>{monthProfit >= 0 ? 'Lucro' : 'Prejuízo'}</span>
          <span className={styles.monthSummaryValue}>{formatBRL(monthRevenue)}</span>
        </div>
        <div className={styles.monthSummaryOperator}>-</div>
        <div className={`${styles.monthSummaryItem} ${styles.monthExpense}`}>
          <span className={styles.monthSummaryLabel}>{monthProfit >= 0 ? 'Lucro' : 'Prejuízo'}</span>
          <span className={styles.monthSummaryValue}>{formatBRL(monthCosts)}</span>
        </div>
        <div className={styles.monthSummaryOperator}>=</div>
        <div className={`${styles.monthSummaryItem} ${monthProfit >= 0 ? styles.monthProfit : styles.monthLoss}`}>
          <span className={styles.monthSummaryLabel}>{monthProfit >= 0 ? 'Lucro' : 'Prejuízo'}</span>
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
  );
}
