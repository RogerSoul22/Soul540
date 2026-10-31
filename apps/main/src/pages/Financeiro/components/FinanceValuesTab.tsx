import { matchesFinancePeriod } from '../../../../../../shared/finance/financePeriod';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceValuesSummary from './FinanceValuesSummary';
import FinanceValuesTable from './FinanceValuesTable';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceValuesTab({ controller }: { controller: FinanceiroController }) {
  const { activeTab, activeEvents, activeFinances, financePeriod, setSelectedEvent } = controller;
  if (activeTab !== 'valores') return null;
  const events = activeEvents
    .filter(
      (event) =>
        (event.budget > 0 ||
          (event.travelCost ?? 0) > 0 ||
          (event.depositValue ?? 0) > 0 ||
          (event.finalValue ?? 0) > 0) &&
        matchesFinancePeriod(event.date, financePeriod),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const totalEstimated = events.reduce((sum, event) => sum + (event.budget || 0), 0);
  const travelCost = events.reduce((sum, event) => sum + (event.travelCost || 0), 0);
  const deposit = events.reduce((sum, event) => sum + (event.depositValue || 0), 0);
  const totalFinal = events.reduce((sum, event) => sum + (event.finalValue || 0), 0);
  return (
    <div className={styles.tabContent}>
      <FinanceValuesSummary
        totalEstimated={totalEstimated}
        travelCost={travelCost}
        deposit={deposit}
        totalFinal={totalFinal}
        eventCount={events.length}
      />
      <FinanceValuesTable events={events} finances={activeFinances} onSelect={setSelectedEvent} />
    </div>
  );
}
