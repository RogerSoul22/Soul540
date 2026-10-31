import { lazy, Suspense } from 'react';
import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import styles from '../styles/Financeiro.module.scss';
import FinanceiroOverviewSummary from './FinanceiroOverviewSummary';

const FinanceiroOverviewCharts = lazy(() => import('./FinanceiroOverviewCharts'));

export default function FinanceiroOverviewTab({ controller }: Props) {
  if (controller.activeTab !== 'geral') return null;
  return (
    <div className={styles.tabContent}>
      <FinanceiroOverviewSummary controller={controller} />
      <Suspense fallback={null}>
        <FinanceiroOverviewCharts controller={controller} />
      </Suspense>
    </div>
  );
}
