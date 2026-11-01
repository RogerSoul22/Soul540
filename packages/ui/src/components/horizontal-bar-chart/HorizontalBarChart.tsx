import { Heading } from '../../../../pentagono/src/index';
import styles from './styles/HorizontalBarChart.module.scss';

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface HorizontalBarChartProps {
  title: string;
  items: BarItem[];
  formatValue?: (value: number) => string;
}

export default function HorizontalBarChart({ title, items, formatValue }: HorizontalBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const total = items.reduce((totalValue, item) => totalValue + item.value, 0);
  const format = formatValue ?? ((value: number) => `R$ ${value.toLocaleString('pt-BR')}`);

  return (
    <div className={styles.chart}>
      <div className={styles.header}>
        <Heading level={3} variant="section" className={styles.title}>
          {title}
        </Heading>
        <span className={styles.total}>{format(total)}</span>
      </div>
      <div className={styles.bars}>
        {items.map((item) => {
          const percentage = (item.value / maxValue) * 100;

          return (
            <div key={item.label} className={styles.barRow}>
              <div className={styles.barLabel}>
                <span className={styles.barDot} style={{ background: item.color }} />
                <span className={styles.barName}>{item.label}</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${percentage}%`, background: item.color }} />
              </div>
              <span className={styles.barValue}>{format(item.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
