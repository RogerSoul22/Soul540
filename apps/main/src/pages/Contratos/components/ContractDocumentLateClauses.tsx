import { ContractDocumentField as EF } from './ContractDocumentField';
import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentLateClauses({ model }: { model: ContractDocumentModel }) {
  return (
    <>
      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 3 – PRORROGAÇÃO DE HORÁRIO</div>
        <p className={styles.clauseText}>
          <EF value={model.clause3Text} onChange={model.setClause3Text} editing={model.editing} multiline />
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
          <EF value={model.clause4Fines} onChange={model.setClause4Fines} editing={model.editing} multiline />
          <br />
          <EF value={model.clause4Force} onChange={model.setClause4Force} editing={model.editing} multiline />
        </p>
      </div>

      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 5 – CONDIÇÕES GERAIS</div>
        <p className={styles.clauseText}>
          <EF value={model.clause5Intro} onChange={model.setClause5Intro} editing={model.editing} multiline />
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
          <EF value={model.clause5Outro} onChange={model.setClause5Outro} editing={model.editing} multiline />
        </p>
      </div>

      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 6 – COMUNICAÇÃO</div>
        <p className={styles.clauseText}>
          Dúvidas ou solicitações devem ser feitas via WhatsApp:{' '}
          <strong>
            <EF
              value={model.clause6Phone}
              onChange={model.setClause6Phone}
              editing={model.editing}
              placeholder="(00) 00000-0000"
            />
          </strong>
          .
        </p>
      </div>

      <div className={styles.clause}>
        <div className={styles.clauseTitle}>CLÁUSULA 7 – VALIDADE</div>
        <p className={styles.clauseText}>
          <EF value={model.clause7Text} onChange={model.setClause7Text} editing={model.editing} multiline />
        </p>
      </div>

      <div className={styles.clause} style={{ marginBottom: 28 }}>
        <div className={styles.clauseTitle}>CLÁUSULA 8 – ALTERAÇÕES</div>
        <p className={styles.clauseText}>
          <EF value={model.clause8Text} onChange={model.setClause8Text} editing={model.editing} multiline />
        </p>
      </div>

      <p className={styles.docDate}>
        <EF value={model.contractCity} onChange={model.setContractCity} editing={model.editing} />, {model.today}
      </p>
    </>
  );
}
