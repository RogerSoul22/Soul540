import { Input, Label } from '../../../../../../packages/pentagono/src/index';
import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventFormDocuments({ controller }: { controller: EventFormController }) {
  const { form, setForm, handlePaymentFile, handleContractFile } = controller;
  return (
    <>
      {/* — Documentos — */}
      {(form.status === 'confirmed' || form.status === 'completed') && (
        <div className={styles.formSection}>
          <p className={styles.formSectionTitle}>Documentos</p>
          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <Label className={styles.label}>Comprovante de Pagamento</Label>
              <Label className={`${styles.fileUploadBtn} ${form.paymentProofName ? styles.fileSelected : ''}`}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {form.paymentProofName || 'Selecionar arquivo'}
                <Input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handlePaymentFile} />
              </Label>
            </div>
            <div className={styles.formGroup}>
              <Label className={styles.label}>Contrato (PDF)</Label>
              <Label className={`${styles.fileUploadBtn} ${form.contractPdfName ? styles.fileSelected : ''}`}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {form.contractPdfName || 'Selecionar PDF'}
                <Input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleContractFile} />
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* — Criador — */}
      <div className={styles.formSection}>
        <p className={styles.formSectionTitle}>Criacao</p>
        <div className={styles.formGroup}>
          <Input
            label="Seu Nome Completo"
            value={form.createdBy}
            onChange={(e) => setForm({ ...form, createdBy: e.target.value })}
            placeholder="Nome de quem esta criando o evento"
          />
        </div>
      </div>

      {/* — Extras — */}
    </>
  );
}
