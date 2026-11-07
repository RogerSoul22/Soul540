import { ContractDocumentField as EF } from './ContractDocumentField';
import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentLateClauses({ model }: { model: ContractDocumentModel }) {
  return (
    <>
      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 3 – PRORROGAÇÃO DE HORÁRIO</div>
        <p className={styles.clauseText}>
          Horas adicionais serão cobradas em 20% do valor total por hora, conforme disponibilidade de insumos e equipe.
        </p>
      </div>

      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 4 – CANCELAMENTO</div>
        <p className={styles.clauseText}>
          Em até{' '}
          <EF
            value={model.cancellationDays}
            onChange={model.setCancellationDays}
            editing={model.editing}
            placeholder="30"
          />{' '}
          dias não haverá multa.
          <br />
          Até 10 dias antes: multa de 20% do valor total.
          <br />
          Até 7 dias antes: multa de 50%.
          <br />
          Menos de 24h antes: cobrança integral.
          <br />
          <br />A Contratada ficará isenta de responsabilidade por eventual não realização do evento em virtude de
          queda/falta de energia, caso fortuito ou de força maior (chuva, tempestades etc.), entretanto será reagendado
          uma nova data nas mesmas condições, ou o valor da entrada será devolvido em até 3 dias úteis para a conta
          bancária.
        </p>
      </div>

      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 5 – CONDIÇÕES GERAIS</div>
        <p className={styles.clauseText}>
          A CONTRATADA fornecerá guardanapos, tábuas, bandejas e utensílios necessários.
          <br />
          <strong>Equipe das pizzas:</strong>{' '}
          <EF
            value={model.pizzaTeam}
            onChange={model.setPizzaTeam}
            editing={model.editing}
            placeholder="Descreva a equipe"
          />
          <br />
          <strong>Equipe da bebida:</strong>{' '}
          <EF
            value={model.drinksTeam}
            onChange={model.setDrinksTeam}
            editing={model.editing}
            placeholder="Descreva a equipe"
          />
          <br />
          <br />
          Até 5 colaboradores de outros serviços poderão se alimentar antes do início sem custo adicional, limitando-se
          aos sabores disponíveis. Demais serviços não listados são responsabilidade dos CONTRATANTES.
        </p>
      </div>

      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 6 – COMUNICAÇÃO</div>
        <p className={styles.clauseText}>
          Dúvidas ou solicitações devem ser feitas via WhatsApp: <strong>(19) 98160-5481</strong>.
        </p>
      </div>

      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 7 – VALIDADE</div>
        <p className={styles.clauseText}>
          Este contrato é válido exclusivamente para o evento descrito e a proposta tem validade de 5 dias a partir da
          data de assinatura.
        </p>
      </div>

      <div className={styles.clause} style={{ marginBottom: 28 }}>
        <div className={styles.clauseTitle}>CLÁUSULA 8 – ALTERAÇÕES</div>
        <p className={styles.clauseText}>
          Qualquer modificação só terá validade se feita por escrito e assinada por ambas as partes.
        </p>
      </div>
    </>
  );
}
