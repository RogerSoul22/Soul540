import { useFinanceiroController } from './hooks/use-financeiro-controller';
import FinanceiroHeader from './components/FinanceiroHeader';
import FinanceiroTabs from './components/FinanceiroTabs';
import FinanceExpensesTab from './components/FinanceExpensesTab';
import FinanceMonthlyTab from './components/FinanceMonthlyTab';
import FinanceOverviewTab from './components/FinanceOverviewTab';
import FinanceEntriesTab from './components/FinanceEntriesTab';
import FinanceValuesTab from './components/FinanceValuesTab';
import FinanceFormModal from './components/FinanceFormModal';
import FinanceDetailsModals from './components/FinanceDetailsModals';
import FinanceXmlImportModal from './components/FinanceXmlImportModal';
import FinanceOfxImportModal from './components/FinanceOfxImportModal';
import FinanceSupportModals from './components/FinanceSupportModals';
import FinanceSettlementModal from './components/FinanceSettlementModal';
import styles from './styles/Financeiro.module.scss';

export default function Financeiro() {
  const controller = useFinanceiroController();
  const {
    activeTab,
    costFilter,
    setCostFilter,
    periodFinances,
    categoryLabels,
    categoryColors,
    monthRevenue,
    monthCosts,
    monthProfit,
    monthMargin,
    insumosRatioMensal,
    maoObraRatioMensal,
    variableCosts,
    fixedCosts,
    showForm,
  } = controller;

  return (
    <div className={styles.page}>
      <FinanceiroHeader controller={controller} />
      <FinanceiroTabs controller={controller} />
      {/* ===== TAB: VISAO GERAL ===== */}
      {activeTab === 'geral' && <FinanceOverviewTab controller={controller} />}

      {activeTab === 'despesas' && (
        <FinanceExpensesTab
          costFilter={costFilter}
          setCostFilter={setCostFilter}
          periodFinances={periodFinances}
          categoryLabels={categoryLabels}
          categoryColors={categoryColors}
        />
      )}

      {activeTab === 'mensal' && (
        <FinanceMonthlyTab
          monthRevenue={monthRevenue}
          monthCosts={monthCosts}
          monthProfit={monthProfit}
          monthMargin={monthMargin}
          insumosRatioMensal={insumosRatioMensal}
          maoObraRatioMensal={maoObraRatioMensal}
          variableCosts={variableCosts}
          fixedCosts={fixedCosts}
        />
      )}
      {/* ===== TAB: LANCAMENTOS ===== */}
      {activeTab === 'lancamentos' && <FinanceEntriesTab controller={controller} />}

      {/* ===== TAB: ESTIMADO x FINAL ===== */}
      {activeTab === 'valores' && <FinanceValuesTab controller={controller} />}

      <FinanceDetailsModals controller={controller} />

      {showForm && <FinanceFormModal controller={controller} />}

      <FinanceXmlImportModal controller={controller} />

      <FinanceOfxImportModal controller={controller} />

      <FinanceSupportModals controller={controller} />
      <FinanceSettlementModal controller={controller} />
    </div>
  );
}
