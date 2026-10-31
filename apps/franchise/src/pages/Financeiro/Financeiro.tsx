import { useFinanceiroController } from './hooks/use-financeiro-controller';
import FinanceFormModal from './components/FinanceFormModal';
import FinanceSupportModals from './components/FinanceSupportModals';
import FinanceEventDetailsModal from './components/FinanceEventDetailsModal';
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
  const { activeTab } = controller;

  return (
    <div className={styles.page}>
      <FinanceiroHeader controller={controller} />
      <FinanceiroOverviewTab controller={controller} />
      {activeTab === 'despesas' && <FinanceiroExpensesTab controller={controller} />}
      {activeTab === 'mensal' && <FinanceiroMonthlyTab controller={controller} />}
      {activeTab === 'valores' && <FinanceiroValuesTab controller={controller} />}
      <FinanceiroEntriesTab controller={controller} />
      <FinanceEventDetailsModal controller={controller} />
      <FinanceFormModal controller={controller} />
      <FinanceSupportModals controller={controller} />
      <FinanceiroInfoModal controller={controller} />
      <FinanceSettlementModal controller={controller} />
    </div>
  );
}
