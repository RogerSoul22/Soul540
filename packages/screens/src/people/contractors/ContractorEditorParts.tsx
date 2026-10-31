import type { ReactNode } from 'react';
import type { ContractorForm } from './contractor-types';
import styles from './styles/ContractorModalFrame.module.scss';

type UpdateContractor = <Field extends keyof ContractorForm>(field: Field, value: ContractorForm[Field]) => void;

export function IndividualFields({ form, update }: { form: ContractorForm; update: UpdateContractor }) {
  return (
    <div className={styles.twoColumns}>
      <EditorField label="Estado civil">
        <select onChange={(event) => update('maritalStatus', event.target.value)} value={form.maritalStatus}>
          <option value="">-- selecione --</option>
          <option value="solteiro">Solteiro(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="divorciado">Divorciado(a)</option>
          <option value="viuvo">Viúvo(a)</option>
          <option value="uniao_estavel">União estável</option>
        </select>
      </EditorField>
      <EditorField label="Profissão">
        <input onChange={(event) => update('profession', event.target.value)} value={form.profession} />
      </EditorField>
    </div>
  );
}

export function IndividualDocumentOptions() {
  return (
    <>
      <option value="">Selecione o tipo</option>
      <option value="CPF">CPF</option>
      <option value="RG">RG</option>
    </>
  );
}

export function EditorField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export function EditorFooter({
  editingId,
  onClose,
  onSubmit,
  valid,
}: {
  editingId: string | null;
  onClose: () => void;
  onSubmit: () => void;
  valid: boolean;
}) {
  return (
    <>
      <button className={styles.cancelButton} onClick={onClose} type="button">
        Cancelar
      </button>
      <button className={styles.primaryButton} disabled={!valid} onClick={onSubmit} type="button">
        {editingId ? 'Salvar alterações' : 'Cadastrar Contratante'}
      </button>
    </>
  );
}
