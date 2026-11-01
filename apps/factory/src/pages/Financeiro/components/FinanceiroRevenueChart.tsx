import { Heading } from '../../../../../../packages/pentagono/src/index';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import styles from '../styles/Financeiro.module.scss';

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatMonth(ym: string) {
  const [year, month] = ym.split('-');
  return `${MONTHS_PT[parseInt(month, 10) - 1]} ${year?.substring(2)}`;
}

type Props = {
  monthlyData: Array<{ month: string; receita: number; despesa: number }>;
};

export default function FinanceiroRevenueChart({ monthlyData }: Props) {
  return (
    <div className={styles.chartSection}>
      <Heading level={3} variant="section" className={styles.sectionTitle}>
        Receita x Despesas por Mes
      </Heading>
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
              tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
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
  );
}
