import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import FinanceEntriesFilters from './FinanceEntriesFilters';
import FinanceEntriesTable from './FinanceEntriesTable';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceEntriesTab({ controller }: { controller: FinanceiroController }) {
  if (controller.activeTab !== 'lancamentos') return null;

  return (
    <div className={styles.tabContent}>
      <FinanceEntriesFilters controller={controller} />
      <FinanceEntriesTable controller={controller} />
    </div>
  );
}
