import { ContractDocumentField as EF } from './ContractDocumentField';
import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentHeader({ model }: { model: ContractDocumentModel }) {
  return (
    <>
      <div className={styles.docHeader}>
        <div className={styles.docCompanyName}>
          <EF value={model.companyName} onChange={model.setCompanyName} editing={model.editing} bold />
        </div>
        <div className={styles.docCompanyMeta}>
          CNPJ <EF value={model.companyCnpj} onChange={model.setCompanyCnpj} editing={model.editing} /> &nbsp;/&nbsp;
          IE&nbsp;
          <EF value={model.companyIe} onChange={model.setCompanyIe} editing={model.editing} />
        </div>
        <div className={styles.docCompanyMeta}>
          <EF value={model.companyAddress} onChange={model.setCompanyAddress} editing={model.editing} />
        </div>
        <div className={styles.docCompanyMeta}>
          Marca fantasia:{' '}
          <strong>
            <EF value={model.companyFantasy} onChange={model.setCompanyFantasy} editing={model.editing} />
          </strong>
        </div>
      </div>

      <div className={styles.docRef}>
        Contrato Nº {model.contract.id.toUpperCase()} | Emitido em {model.createdDate}
      </div>

      <div className={styles.docTitle}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>

      <div className={styles.partiesBlock}>
        <p className={styles.partiesLabel}>CONTRATANTES:</p>
        <div className={styles.clauseBox}>
          <div className={styles.clauseGrid}>
            <div className={styles.clauseField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.clauseFieldLabel}>Nome: </span>
              <EF value={model.clientName} onChange={model.setClientName} editing={model.editing} bold />
            </div>
            <div className={styles.clauseField}>
              <span className={styles.clauseFieldLabel}>CPF: </span>
              <EF
                value={model.clientDocument}
                onChange={model.setClientDocument}
                editing={model.editing}
                placeholder="000.000.000-00"
              />
            </div>
            <div className={styles.clauseField}>
              <span className={styles.clauseFieldLabel}>RG: </span>
              <EF
                value={model.clientRg}
                onChange={model.setClientRg}
                editing={model.editing}
                placeholder="00.000.000-0"
              />
            </div>
            <div className={styles.clauseField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.clauseFieldLabel}>Endereço: </span>
              <EF
                value={model.clientAddress}
                onChange={model.setClientAddress}
                editing={model.editing}
                placeholder="Rua, nº – Bairro – Cidade, Estado"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
