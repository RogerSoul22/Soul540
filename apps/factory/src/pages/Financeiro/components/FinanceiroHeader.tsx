import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { Button, InfoButton, Input, PageHeader } from '../../../../../../packages/pentagono/src/index';
import FinancePeriodFilter from '../../../../../../shared/finance/components/FinancePeriodFilter';
import styles from '../styles/Financeiro.module.scss';
type TabType = 'geral' | 'despesas' | 'mensal' | 'lancamentos';

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
      {/* Header */}
      <PageHeader
        title="Financeiro"
        subtitle="Controle completo de receitas, despesas e indicadores"
        titleExtra={
          <>
            <InfoButton label="Como usar esta página" onClick={() => setShowInfo(true)} />
          </>
        }
        actions={
          <>
            <Input ref={xmlInputRef} type="file" accept=".xml" style={{ display: 'none' }} onChange={handleXmlFile} />
            <Button
              variant="secondary"
              size="sm"
              className={styles.btnXml}
              onClick={() => xmlInputRef.current?.click()}
            >
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
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + Novo Lançamento
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className={styles.tabs}>
        {(
          [
            ['geral', 'Visão Geral'],
            ['despesas', 'Painel Despesas'],
            ['mensal', 'Painel do Período'],
            ['lancamentos', 'Lançamentos'],
          ] as [TabType, string][]
        ).map(([key, label]) => (
          <Button
            variant="chip"
            key={key}
            className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </Button>
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
    </>
  );
}
