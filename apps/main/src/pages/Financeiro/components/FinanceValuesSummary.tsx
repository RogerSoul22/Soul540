import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';

type FinanceValuesSummaryProps = {
  totalEstimated: number;
  travelCost: number;
  deposit: number;
  totalFinal: number;
  eventCount: number;
};

export default function FinanceValuesSummary({
  totalEstimated,
  travelCost,
  deposit,
  totalFinal,
  eventCount,
}: FinanceValuesSummaryProps) {
  const difference = totalFinal - totalEstimated;
  const items = [
    ['Total Estimado', formatBRL(totalEstimated), ''],
    ['Deslocamento', formatBRL(travelCost), styles.amber],
    ['Sinal Recebido', formatBRL(deposit), styles.green],
    ['Total Final', formatBRL(totalFinal), totalFinal >= totalEstimated ? styles.green : styles.amber],
    ['Diferença', (difference >= 0 ? '+' : '') + formatBRL(difference), difference >= 0 ? styles.green : styles.red],
    ['Eventos', String(eventCount), ''],
  ];
  return (
    <div className={styles.summaryBar + ' ' + styles.eventFinancialSummary}>
      {items.map(([label, value, color], index) => (
        <span key={label} className={styles.summaryItem}>
          {index > 0 && <span className={styles.summaryDivider} />}
          <span className={styles.summaryItemLabel}>{label}</span>
          <span className={styles.summaryItemValue + ' ' + color}>{value}</span>
        </span>
      ))}
    </div>
  );
}
