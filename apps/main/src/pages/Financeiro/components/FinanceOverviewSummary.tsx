import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={styles.summaryItem}>
      <span className={styles.summaryItemLabel}>{label}</span>
      <span className={styles.summaryItemValue + ' ' + (tone || '')}>{value}</span>
    </div>
  );
}

export default function FinanceOverviewSummary({ controller }: { controller: FinanceiroController }) {
  const {
    totalRevenue,
    totalCosts,
    profit,
    margin,
    realizedIncome,
    projectedIncome,
    wallet,
    walletBalance,
    bankWallet,
    faturamentoTotal,
    faturamentoRecebido,
    saldoEmAberto,
    paymentMethodSummary,
    paymentMethodTotal,
  } = controller;

  return (
    <>
      <div className={styles.summaryBar + ' ' + styles.eventFinancialSummary}>
        <Metric label="Receitas" value={formatBRL(totalRevenue)} tone={styles.green} />
        <div className={styles.summaryDivider} />
        <Metric label="Custos" value={formatBRL(totalCosts)} tone={styles.red} />
        <div className={styles.summaryDivider} />
        <Metric label="Resultado" value={formatBRL(profit)} tone={profit >= 0 ? styles.green : styles.red} />
        <div className={styles.summaryDivider} />
        <Metric label="Margem" value={margin.toFixed(1) + '%'} />
        <div className={styles.summaryDivider} />
        <Metric label="Recebido" value={formatBRL(realizedIncome)} tone={styles.green} />
        <div className={styles.summaryDivider} />
        <Metric label="A receber" value={formatBRL(projectedIncome)} />
      </div>

      <div className={styles.walletGrid}>
        <WalletCard
          title="Saldo bancário"
          value={bankWallet.accounts.length ? formatBRL(bankWallet.balance) : '--'}
          detail={
            bankWallet.accounts.length
              ? bankWallet.accounts.length + ' conta(s) atualizada(s) por extrato OFX.'
              : 'Nenhum saldo bancário importado.'
          }
          tone={bankWallet.balance >= 0 ? styles.green : styles.red}
        />
        <WalletCard
          title="Carteira financeira"
          value={formatBRL(walletBalance)}
          detail={'Recebido ' + formatBRL(wallet.received) + ' · Pago ' + formatBRL(wallet.paid)}
          tone={walletBalance >= 0 ? styles.green : styles.red}
        />
        <WalletCard
          title="Faturamento x aberto"
          value={formatBRL(faturamentoTotal)}
          detail={'Recebido ' + formatBRL(faturamentoRecebido) + ' · Em aberto ' + formatBRL(saldoEmAberto)}
          tone={styles.green}
        />
      </div>

      <div className={styles.agendamentosCard + ' ' + styles.paymentMethodsSection}>
        <div className={styles.agendamentosHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Recebimentos por forma</h3>
            <p className={styles.sectionSubtitle}>Total identificado: {formatBRL(paymentMethodTotal)}</p>
          </div>
        </div>
        {!paymentMethodSummary.length ? (
          <p className={styles.agendamentosEmpty}>Nenhum recebimento identificado no período.</p>
        ) : (
          <div className={styles.paymentMethodCards}>
            {paymentMethodSummary.map((item) => (
              <div key={item.method} className={styles.paymentMethodCard}>
                <div className={styles.paymentMethodCardHeader}>
                  <strong>{item.method === 'nao-informado' ? 'Não informado' : item.method}</strong>
                  <span>{formatBRL(item.amount)}</span>
                </div>
                <div className={styles.paymentMethodProgress}>
                  <span style={{ width: (item.amount / (paymentMethodTotal || 1)) * 100 + '%' }} />
                </div>
                <small>{item.count} recebimento(s)</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function WalletCard({ title, value, detail, tone }: { title: string; value: string; detail: string; tone: string }) {
  return (
    <div className={styles.agendamentosCard}>
      <div className={styles.agendamentosHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      <div className={styles.summaryItemValue + ' ' + tone}>{value}</div>
      <p className={styles.agendamentosEmpty}>{detail}</p>
    </div>
  );
}
