import type { useFinanceiroController } from '../hooks/use-financeiro-controller';
type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { isValid, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GaugeChart } from '../../../../../../packages/ui/src/index';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';
import type { FinanceStatus } from '../types/finance-controller-types';
import FinanceiroRevenueChart from './FinanceiroRevenueChart';
function safeFormat(date: string | undefined | null, fmt: string, options?: Parameters<typeof format>[2]) {
  if (!date) return '—';
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, fmt, options) : '—';
}

export default function FinanceiroOverviewCharts({ controller }: Props) {
  const {
    monthlyData,
    margin,
    insumosRatio,
    maoObraRatio,
    totalContracted,
    totalReceived,
    eventsWithBudget,
    handleEventFinanceStatus,
  } = controller;
  return (
    <>
      <FinanceiroRevenueChart monthlyData={monthlyData} />

      {/* Gauges */}
      <div className={styles.gaugesGrid}>
        <div className={styles.gaugeCard}>
          <GaugeChart
            label="Margem de Lucro"
            value={margin}
            max={100}
            suffix="%"
            color={margin >= 20 ? '#4ade80' : margin >= 10 ? '#fbbf24' : '#f87171'}
          />
        </div>
        <div className={styles.gaugeCard}>
          <GaugeChart
            label="Insumos / Receita"
            value={insumosRatio}
            max={100}
            suffix="%"
            color={insumosRatio <= 30 ? '#4ade80' : insumosRatio <= 45 ? '#fbbf24' : '#f87171'}
          />
        </div>
        <div className={styles.gaugeCard}>
          <GaugeChart
            label="Mao de Obra / Receita"
            value={maoObraRatio}
            max={100}
            suffix="%"
            color={maoObraRatio <= 25 ? '#4ade80' : maoObraRatio <= 40 ? '#fbbf24' : '#f87171'}
          />
        </div>
      </div>

      {/* Events Budget Card */}
      <div className={styles.agendamentosCard}>
        <div className={styles.agendamentosHeader}>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
            Valores dos Agendamentos
          </h3>
          <div className={styles.agendamentosPills}>
            <div className={styles.agendamentosPill}>
              <span className={styles.agendamentosPillLabel}>Contratado</span>
              <span className={styles.agendamentosPillValue}>{formatBRL(totalContracted)}</span>
            </div>
            <div className={styles.agendamentosPill}>
              <span className={styles.agendamentosPillLabel}>Recebido</span>
              <span className={`${styles.agendamentosPillValue} ${styles.green}`}>{formatBRL(totalReceived)}</span>
            </div>
            <div className={styles.agendamentosPill}>
              <span className={styles.agendamentosPillLabel}>Pendente</span>
              <span className={`${styles.agendamentosPillValue} ${styles.amber}`}>
                {formatBRL(totalContracted - totalReceived)}
              </span>
            </div>
          </div>
        </div>

        {eventsWithBudget.length === 0 ? (
          <p className={styles.agendamentosEmpty}>Nenhum agendamento com valor cadastrado.</p>
        ) : (
          <div className={styles.agendamentosList}>
            {eventsWithBudget.map(({ event, finance }) => (
              <div key={event.id} className={styles.agendamentoRow}>
                <div className={styles.agendamentoInfo}>
                  <span className={styles.agendamentoName}>{event.name}</span>
                  <span className={styles.agendamentoDate}>
                    {safeFormat(event.date, "dd 'de' MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className={styles.agendamentoRight}>
                  <span className={styles.agendamentoValue}>{formatBRL(event.budget ?? 0)}</span>
                  {finance ? (
                    <select
                      className={[
                        styles.agendamentoStatus,
                        finance.status === 'paid' ? styles.statusReceived : styles.statusPending,
                      ].join(' ')}
                      value={finance.status}
                      onChange={(e) => handleEventFinanceStatus(finance, e.target.value as FinanceStatus)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </select>
                  ) : (
                    <span className={styles.agendamentoNoFinance}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
