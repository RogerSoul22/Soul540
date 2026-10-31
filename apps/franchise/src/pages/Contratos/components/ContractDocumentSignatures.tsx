import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContractDocumentField as EF } from './ContractDocumentField';
import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentSignatures({ model }: { model: ContractDocumentModel }) {
  return (
    <>
      <p className={styles.docDate}>
        <EF value={model.contractCity} onChange={model.setContractCity} editing={model.editing} />, {model.today}
      </p>

      <div className={styles.sigGrid}>
        <div className={styles.sigBlock}>
          <div className={styles.sigLine}>
            <div className={styles.sigName}>
              <EF value={model.companyName} onChange={model.setCompanyName} editing={model.editing} />
            </div>
            <div className={styles.sigRole}>CONTRATADA</div>
            <div className={styles.sigDoc}>
              <EF value={model.signerName} onChange={model.setSignerName} editing={model.editing} /> – CPF{' '}
              <EF value={model.signerCpf} onChange={model.setSignerCpf} editing={model.editing} />
            </div>
          </div>
        </div>
        <div className={styles.sigBlock}>
          <div className={styles.sigLine}>
            <div className={styles.sigName}>{model.clientName}</div>
            <div className={styles.sigRole}>CONTRATANTE</div>
            <div className={styles.sigDoc}>
              CPF: {model.clientDocument || '___________'} &nbsp;|&nbsp; RG: {model.clientRg || '___________'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.witnessGrid}>
        <div className={styles.witnessBlock}>
          <div className={styles.witnessLine}>
            <div className={styles.witnessRole}>Testemunha 1</div>
            <div className={styles.witnessBlank}>
              Nome: ___________________________
              <br />
              CPF: ____________________________
            </div>
          </div>
        </div>
        <div className={styles.witnessBlock}>
          <div className={styles.witnessLine}>
            <div className={styles.witnessRole}>Testemunha 2</div>
            <div className={styles.witnessBlank}>
              Nome: ___________________________
              <br />
              CPF: ____________________________
            </div>
          </div>
        </div>
      </div>

      <div className={styles.docFooter}>
        Documento gerado pelo sistema Soul540 | {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </div>
    </>
  );
}
