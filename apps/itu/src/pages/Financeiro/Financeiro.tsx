import { useFinanceiroController } from './hooks/use-financeiro-controller';
import FinanceFormModal from './components/FinanceFormModal';
import FinanceSupportModals from './components/FinanceSupportModals';
import FinanceEventDetailsModal from './components/FinanceEventDetailsModal';
import { SkeletonContent } from '../../../../../packages/pentagono/src/index';
import { useApp } from '../../contexts/AppContext';
import styles from './styles/Financeiro.module.scss';
import FinanceiroHeader from './components/FinanceiroHeader';
import FinanceiroOverviewTab from './components/FinanceiroOverviewTab';
import FinanceiroExpensesTab from './components/FinanceiroExpensesTab';
import FinanceiroMonthlyTab from './components/FinanceiroMonthlyTab';
import FinanceiroValuesTab from './components/FinanceiroValuesTab';
import FinanceiroEntriesTab from './components/FinanceiroEntriesTab';
import FinanceiroInfoModal from './components/FinanceiroInfoModal';
import FinanceSettlementModal from './components/FinanceSettlementModal';

export default function Financeiro() {
  const controller = useFinanceiroController();
  const { dataLoading } = useApp();
  const { activeTab } = controller;

  return (
    <div className={styles.page}>
      <FinanceiroHeader controller={controller} />
      {dataLoading && <SkeletonContent variant="page" label="Carregando financeiro..." />}
      {!dataLoading && <FinanceiroOverviewTab controller={controller} />}
      {!dataLoading && activeTab === 'despesas' && <FinanceiroExpensesTab controller={controller} />}
      {!dataLoading && activeTab === 'mensal' && <FinanceiroMonthlyTab controller={controller} />}
      {!dataLoading && activeTab === 'valores' && <FinanceiroValuesTab controller={controller} />}
      {!dataLoading && (activeTab === 'lancamentos' || activeTab === 'eventos-avulsos') && (
        <FinanceiroEntriesTab controller={controller} />
      )}
      <FinanceEventDetailsModal controller={controller} />
      <FinanceFormModal controller={controller} />
      <FinanceSupportModals controller={controller} />
      <FinanceiroInfoModal controller={controller} />
      <FinanceSettlementModal controller={controller} />
    </div>
  );
}
