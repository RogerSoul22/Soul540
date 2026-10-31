import FinancePeriodFilter from '../../../../../../shared/finance/components/FinancePeriodFilter';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

type TabType = 'geral' | 'despesas' | 'mensal' | 'lancamentos' | 'valores';

const tabs: Array<[TabType, string]> = [
  ['geral', 'Visão Geral'],
  ['despesas', 'Painel Despesas'],
  ['mensal', 'Painel do Período'],
  ['lancamentos', 'Lançamentos'],
  ['valores', 'Financeiro dos Eventos'],
];

export default function FinanceiroTabs({ controller }: { controller: FinanceiroController }) {
  const { activeTab, setActiveTab, financePeriod, setFinancePeriod } = controller;

  return (
    <>
      <div className={styles.tabs}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <FinancePeriodFilter period={financePeriod} onChange={setFinancePeriod} accentColor="#f5a000" />
    </>
  );
}
