import { ContractDocumentField as EF } from './ContractDocumentField';
import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

import { ContractDocumentLateClauses } from './ContractDocumentLateClauses';

export function ContractDocumentClauses({ model }: { model: ContractDocumentModel }) {
  return (
    <>
      <ContractDocumentLateClauses model={model} />
    </>
  );
}
