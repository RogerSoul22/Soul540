import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceiroOverviewSummary({ controller }: Props) {
  const {
    totalRevenue,
    totalCosts,
    profit,
    margin,
    walletBalance,
    faturamentoTotal,
    faturamentoRecebido,
    saldoEmAberto,
  } = controller;
  return (
    <>
      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Receita Total</span>
          <span className={`${styles.summaryItemValue} ${styles.green}`}>{formatBRL(totalRevenue)}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Despesas Total</span>
          <span className={`${styles.summaryItemValue} ${styles.red}`}>{formatBRL(totalCosts)}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>{profit >= 0 ? 'Lucro' : 'Prejuizo'}</span>
          <span className={`${styles.summaryItemValue} ${profit >= 0 ? styles.green : styles.red}`}>
            {formatBRL(Math.abs(profit))}
          </span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Margem</span>
          <span className={`${styles.summaryItemValue} ${styles.amber}`}>{margin.toFixed(1)}%</span>
        </div>
      </div>

      {/* Carteira + Faturamento x Saldo em Aberto */}
      <div className={styles.walletGrid}>
        <div className={styles.agendamentosCard}>
          <div className={styles.agendamentosHeader}>
            <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
              Carteira
            </h3>
          </div>
          <div className={styles.summaryItem} style={{ padding: '4px 0' }}>
            <span className={styles.summaryItemLabel}>Saldo disponível</span>
            <span
              className={`${styles.summaryItemValue} ${walletBalance >= 0 ? styles.green : styles.red}`}
              style={{ fontSize: 28 }}
            >
              {formatBRL(walletBalance)}
            </span>
          </div>
          <p className={styles.agendamentosEmpty} style={{ marginTop: 4 }}>
            Receitas já recebidas menos custos já pagos no período selecionado.
          </p>
        </div>
        <div className={styles.agendamentosCard}>
          <div className={styles.agendamentosHeader}>
            <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
              Faturamento x Saldo em Aberto
            </h3>
          </div>
          <div className={styles.summaryBar} style={{ padding: '4px 0' }}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Faturamento</span>
              <span className={styles.summaryItemValue}>{formatBRL(faturamentoTotal)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Recebido</span>
              <span className={`${styles.summaryItemValue} ${styles.green}`}>{formatBRL(faturamentoRecebido)}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryItemLabel}>Em Aberto</span>
              <span className={`${styles.summaryItemValue} ${saldoEmAberto > 0 ? styles.amber : styles.green}`}>
                {formatBRL(saldoEmAberto)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue vs Costs Chart */}
    </>
  );
}
