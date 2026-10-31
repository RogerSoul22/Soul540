import { lazy, Suspense } from 'react';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceOverviewSummary from './FinanceOverviewSummary';
import FinanceOverviewInsights from './FinanceOverviewInsights';
import FinanceOverviewAppointments from './FinanceOverviewAppointments';
import styles from '../styles/Financeiro.module.scss';

const FinanceOverviewChart = lazy(() => import('./FinanceOverviewChart'));

export default function FinanceOverviewTab({ controller }: { controller: FinanceiroController }) {
  if (controller.activeTab !== 'geral') return null;

  return (
    <div className={styles.tabContent}>
      <FinanceOverviewSummary controller={controller} />
      <FinanceOverviewInsights controller={controller} />
      <Suspense fallback={null}>
        <FinanceOverviewChart controller={controller} />
      </Suspense>
      <FinanceOverviewAppointments controller={controller} />
    </div>
  );
}
