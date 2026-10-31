import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import styles from '../styles/Financeiro.module.scss';
import FinanceiroOverviewSummary from './FinanceiroOverviewSummary';
import FinanceiroOverviewCharts from './FinanceiroOverviewCharts';

export default function FinanceiroOverviewTab({ controller }: Props) {
  if (controller.activeTab !== 'geral') return null;
  return (
    <div className={styles.tabContent}>
      <FinanceiroOverviewSummary controller={controller} />
      <FinanceiroOverviewCharts controller={controller} />
    </div>
  );
}
