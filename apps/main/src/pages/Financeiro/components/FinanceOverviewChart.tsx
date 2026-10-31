import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={styles.gaugeCard}>
      <div className={styles.gaugeHeader}>
        <span>{label}</span>
        <strong>{value.toFixed(1)}%</strong>
      </div>
      <div className={styles.gaugeTrack}>
        <span style={{ width: Math.min(100, Math.max(0, value)) + '%', background: color }} />
      </div>
    </div>
  );
}

export default function FinanceOverviewChart({ controller }: { controller: FinanceiroController }) {
  const { monthlyData, profit, margin, insumosRatio, maoObraRatio } = controller;
  return (
    <>
      <div className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Receita x despesas por mês</h3>
        <div className={styles.chartContainer}>
          {!monthlyData.length ? (
            <p className={styles.agendamentosEmpty}>Nenhum lançamento no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barGap={4} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => formatBRL(Number(value)).replace(',00', '')} />
                <Tooltip formatter={(value) => formatBRL(Number(value))} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" name="Despesa" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className={styles.gaugesGrid}>
        <Gauge label="Margem" value={margin} color={profit >= 0 ? '#4ade80' : '#f87171'} />
        <Gauge
          label="Insumos / receita"
          value={insumosRatio}
          color={insumosRatio <= 30 ? '#4ade80' : insumosRatio <= 45 ? '#fbbf24' : '#f87171'}
        />
        <Gauge
          label="Mão de obra / receita"
          value={maoObraRatio}
          color={maoObraRatio <= 25 ? '#4ade80' : maoObraRatio <= 40 ? '#fbbf24' : '#f87171'}
        />
      </div>
    </>
  );
}
