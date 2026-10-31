import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentToolbar({
  model,
  onGeneratePdf,
  onClose,
}: {
  model: ContractDocumentModel;
  onGeneratePdf: () => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <span className={styles.contractRef}>#{model.contract.id.split('-').pop()?.toUpperCase()}</span>
        <span className={styles.contractClient}>{model.clientName}</span>
      </div>
      <div className={styles.topBarActions}>
        <button
          className={`${styles.btnBar} ${model.editing ? styles.btnBarActive : ''}`}
          onClick={() => model.setEditing((v) => !v)}
        >
          {model.editing ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          )}
          <span>{model.editing ? 'Visualizar' : 'Editar'}</span>
        </button>
        <button className={styles.btnBar} onClick={() => window.print()}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span>Imprimir</span>
        </button>
        <button
          className={`${styles.btnBar} ${styles.btnBarPrimary}`}
          onClick={onGeneratePdf}
          disabled={model.generating}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{model.generating ? 'Gerando...' : 'Gerar PDF'}</span>
        </button>
        <button className={styles.btnBarClose} onClick={onClose}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
