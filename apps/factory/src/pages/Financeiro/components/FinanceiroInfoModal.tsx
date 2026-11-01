import { Button, Modal } from '../../../../../../packages/pentagono/src/index';
import type { useFinanceiroController } from '../hooks/use-financeiro-controller';

type Controller = ReturnType<typeof useFinanceiroController>;
type Props = { controller: Controller };
import styles from '../styles/Financeiro.module.scss';

export default function FinanceiroInfoModal({ controller }: Props) {
  const { showInfo, setShowInfo } = controller;
  return (
    <>
      {showInfo && (
        <Modal title="Sobre esta página" onClose={() => setShowInfo(false)} closeOnOverlay maxWidth={480} flush>
          <div className={styles.modalBody}>
            <div className={styles.infoSection}>
              <p className={styles.infoSectionTitle}>O que é esta página?</p>
              <p className={styles.infoText}>
                A página <strong>Financeiro</strong> centraliza o controle de receitas e despesas do seu negócio.
                Visualize indicadores, gráficos por categoria, evolução mensal e gerencie todos os lançamentos.
              </p>
            </div>
            <div className={styles.infoSection}>
              <p className={styles.infoSectionTitle}>Como registrar um lançamento</p>
              <ol className={styles.infoList}>
                <li>
                  Clique em <strong>Novo Lançamento</strong> no canto superior direito.
                </li>
                <li>
                  Selecione o tipo: <strong>Receita</strong> ou <strong>Despesa</strong>.
                </li>
                <li>Escolha a categoria, descreva o lançamento e informe o valor.</li>
                <li>
                  <strong>Competência</strong> é a data prevista; <strong>Caixa</strong> usa a data efetiva de cada
                  baixa.
                </li>
                <li>
                  Para liquidar, informe valor, data efetiva, método e referência. Uma receita liquidada aparece como
                  Recebido; uma despesa, como Pago.
                </li>
                <li>
                  Pendente ainda não possui baixa, Parcial possui baixa incompleta e Cancelado não compõe os totais.
                </li>
                <li>
                  Clique em <strong>Salvar</strong> para confirmar.
                </li>
              </ol>
            </div>
            <div className={styles.infoSection}>
              <p className={styles.infoSectionTitle}>Regras financeiras</p>
              <ul className={styles.infoList}>
                <li>
                  <strong>Liquidação é o único estado financeiro:</strong> “Recebido” e “Pago” apenas descrevem receita
                  e despesa depois da liquidação.
                </li>
                <li>
                  Competência usa a data prevista; caixa usa a data efetiva da liquidação. Sinais entram no mês em que
                  foram recebidos.
                </li>
                <li>
                  O status de um lançamento (Pendente, Pago, Recebido) pode ser alterado livremente pelo seletor, sem
                  necessidade de justificativa.
                </li>
                <li>
                  <strong>Evento cancelado exclui automaticamente</strong> a previsão financeira vinculada, mesmo que já
                  tenha baixa registrada.
                </li>
              </ul>
            </div>
            <div className={styles.infoSection}>
              <p className={styles.infoSectionTitle}>Abas disponíveis</p>
              <ul className={styles.infoList}>
                <li>
                  <strong>Geral</strong> — indicadores de saúde financeira e gráfico de receitas vs despesas.
                </li>
                <li>
                  <strong>Despesas</strong> — breakdown por categoria fixa e variável.
                </li>
                <li>
                  <strong>Mensal</strong> — evolução mês a mês.
                </li>
                <li>
                  <strong>Lançamentos</strong> — tabela completa com filtros e busca.
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <span />
            <Button variant="primary" onClick={() => setShowInfo(false)}>
              Entendido
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
