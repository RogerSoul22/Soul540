import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceInfoModal({ controller }: { controller: FinanceiroController }) {
  const { showInfo, setShowInfo } = controller;
  if (!showInfo) return null;
  return (
    <div className={styles.overlay} onClick={() => setShowInfo(false)}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sobre esta página</h2>
          <button className={styles.modalClose} onClick={() => setShowInfo(false)} aria-label="Fechar">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={styles.modalBody}>
          <section className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>O que é esta página?</p>
            <p className={styles.infoText}>
              A página <strong>Financeiro</strong> centraliza receitas e despesas. Visualize indicadores, gráficos por
              categoria, evolução mensal e gerencie lançamentos.
            </p>
          </section>
          <section className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Como registrar um lançamento</p>
            <ol className={styles.infoList}>
              <li>
                Clique em <strong>Novo Lançamento</strong>.
              </li>
              <li>
                Selecione <strong>Receita</strong> ou <strong>Despesa</strong>.
              </li>
              <li>Escolha a categoria, descreva o lançamento e informe o valor.</li>
              <li>
                <strong>Competência</strong> usa a data prevista; <strong>Caixa</strong> usa a data efetiva.
              </li>
              <li>Para liquidar, informe valor, data, método e referência.</li>
              <li>Pendente não possui baixa; Parcial possui baixa incompleta; Cancelado não compõe totais.</li>
            </ol>
          </section>
          <section className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Regras financeiras</p>
            <ul className={styles.infoList}>
              <li>
                <strong>Liquidação é o único estado financeiro.</strong> Recebido e Pago descrevem receitas e despesas
                liquidadas.
              </li>
              <li>Competência usa a data prevista; Caixa usa a data efetiva de cada liquidação.</li>
              <li>Liquidações podem ser parciais e exigem justificativa para correção ou estorno.</li>
              <li>Eventos cancelados excluem automaticamente a previsão financeira vinculada.</li>
              <li>O fechamento do evento não cria recebimento, pagamento ou baixa automática.</li>
            </ul>
          </section>
          <section className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>DRE, extratos e unidades</p>
            <ul className={styles.infoList}>
              <li>O DRE considera lançamentos classificados; OFX sem categoria fica fora até ser classificado.</li>
              <li>A importação OFX é revisada no servidor e duplicidades são ignoradas.</li>
              <li>A unidade de origem do lançamento é preservada nos relatórios gerenciais.</li>
            </ul>
          </section>
        </div>
        <div className={styles.modalFooter}>
          <span />
          <button className={styles.btnPrimary} onClick={() => setShowInfo(false)}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
