import type { FranchiseForm, FranchiseStatus } from '../types/franchise-types';
import styles from '../styles/Franquias.module.scss';

type Props = {
  form: FranchiseForm;
  editing: boolean;
  onChange: (form: FranchiseForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function FranchiseFormModal({ form, editing, onChange, onClose, onSubmit }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editing ? 'Editar Franquia' : 'Nova Franquia'}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGrid2}>
            <Field label="Nome da Unidade *" value={form.name} onChange={(name) => onChange({ ...form, name })} />
            <Field label="Franqueado *" value={form.owner} onChange={(owner) => onChange({ ...form, owner })} />
          </div>
          <div className={styles.formGrid3}>
            <Field label="Cidade" value={form.city} onChange={(city) => onChange({ ...form, city })} />
            <Field label="Estado" value={form.state} onChange={(state) => onChange({ ...form, state })} />
            <label className={styles.formGroup}>
              <span className={styles.label}>Status</span>
              <select
                className={styles.input}
                value={form.status}
                onChange={(event) => onChange({ ...form, status: event.target.value as FranchiseStatus })}
              >
                <option value="ativa">Ativa</option>
                <option value="em_implantacao">Em Implantação</option>
                <option value="suspensa">Suspensa</option>
                <option value="encerrada">Encerrada</option>
              </select>
            </label>
          </div>
          <div className={styles.formGrid2}>
            <Field
              label="Royalties Mensais (R$)"
              type="number"
              value={form.monthlyFee}
              onChange={(monthlyFee) => onChange({ ...form, monthlyFee })}
            />
            <Field
              label="Data de Abertura"
              type="date"
              value={form.openDate}
              onChange={(openDate) => onChange({ ...form, openDate })}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={onSubmit} disabled={!form.name || !form.owner}>
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className={styles.formGroup}>
      <span className={styles.label}>{label}</span>
      <input className={styles.input} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
