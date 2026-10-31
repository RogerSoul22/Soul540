import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GaugeChart } from '../../../../../../packages/ui/src/index';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import { ptBR } from 'date-fns/locale';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceiroOverviewCharts({ controller }: Props) {
  const {
    monthlyData,
    margin,
    insumosRatio,
    maoObraRatio,
    totalFinalValue,
    eventsWithFinalValue,
    formatMonth,
    safeFormatDate,
  } = controller;
  return (
    <>
      <div className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Receita x Despesas por Mes</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData} barGap={4} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a2235',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '13px',
                }}
                formatter={(value: unknown) => [formatBRL(Number(value))]}
                labelFormatter={(label: unknown) => formatMonth(String(label))}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="receita" name="Receita" fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" name="Despesa" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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

      {/* Events Final Value Card */}
      <div className={styles.agendamentosCard}>
        <div className={styles.agendamentosHeader}>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
            Valores dos Agendamentos
          </h3>
          <div className={styles.agendamentosPills}>
            <div className={styles.agendamentosPill}>
              <span className={styles.agendamentosPillLabel}>Total Final</span>
              <span className={`${styles.agendamentosPillValue} ${styles.green}`}>{formatBRL(totalFinalValue)}</span>
            </div>
          </div>
        </div>

        {eventsWithFinalValue.length === 0 ? (
          <p className={styles.agendamentosEmpty}>Nenhum agendamento com valor final cadastrado.</p>
        ) : (
          <div className={styles.agendamentosList}>
            {eventsWithFinalValue.map((event) => (
              <div key={event.id} className={styles.agendamentoRow}>
                <div className={styles.agendamentoInfo}>
                  <span className={styles.agendamentoName}>{event.name}</span>
                  <span className={styles.agendamentoDate}>
                    {safeFormatDate(event.date, "dd 'de' MMM yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div className={styles.agendamentoRight}>
                  <span className={`${styles.agendamentoValue} ${styles.green}`}>
                    {formatBRL(event.finalValue || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
