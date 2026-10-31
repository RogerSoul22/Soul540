import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { Button } from '../../../../../../packages/ui/src/index';
import FinancePeriodFilter from '../../../../../../shared/finance/components/FinancePeriodFilter';
import styles from '../styles/Financeiro.module.scss';
type TabType = 'geral' | 'despesas' | 'mensal' | 'lancamentos' | 'valores';

export default function FinanceiroHeader({ controller }: Props) {
  const {
    activeTab,
    setActiveTab,
    financePeriod,
    setFinancePeriod,
    setLancamentosPage,
    setShowForm,
    resetForm,
    xmlInputRef,
    handleXmlFile,
    setShowInfo,
  } = controller;
  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Financeiro</h1>
            <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title="Como usar esta página">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
          <p className={styles.subtitle}>Controle completo de receitas, despesas e indicadores</p>
        </div>
        <div className={styles.headerActions}>
          <input ref={xmlInputRef} type="file" accept=".xml" style={{ display: 'none' }} onChange={handleXmlFile} />
          <button className={styles.btnXml} onClick={() => xmlInputRef.current?.click()}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
            Importar XML
          </button>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(
          [
            ['geral', 'Visão Geral'],
            ['despesas', 'Painel Despesas'],
            ['mensal', 'Painel do Período'],
            ['lancamentos', 'Lançamentos'],
            ['valores', 'Financeiro dos Eventos'],
          ] as [TabType, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <FinancePeriodFilter
        period={financePeriod}
        onChange={(period) => {
          setFinancePeriod(period);
          setLancamentosPage(1);
        }}
        accentColor="#1464b4"
      />

      {/* ===== TAB: VISAO GERAL ===== */}
    </>
  );
}
