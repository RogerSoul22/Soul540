import { Button, Input, Label, Modal, Select } from '../../../../../../packages/pentagono/src/index';
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
    <Modal title={editing ? 'Editar Franquia' : 'Nova Franquia'} onClose={onClose} closeOnOverlay maxWidth={520} flush>
      <div className={styles.modalBody}>
        <div className={styles.formGrid2}>
          <Field label="Nome da Unidade *" value={form.name} onChange={(name) => onChange({ ...form, name })} />
          <Field label="Franqueado *" value={form.owner} onChange={(owner) => onChange({ ...form, owner })} />
        </div>
        <div className={styles.formGrid3}>
          <Field label="Cidade" value={form.city} onChange={(city) => onChange({ ...form, city })} />
          <Field label="Estado" value={form.state} onChange={(state) => onChange({ ...form, state })} />
          <Label className={styles.formGroup}>
            <span className={styles.label}>Status</span>
            <Select
              className={styles.input}
              value={form.status}
              onChange={(event) => onChange({ ...form, status: event.target.value as FranchiseStatus })}
            >
              <option value="ativa">Ativa</option>
              <option value="em_implantacao">Em Implantação</option>
              <option value="suspensa">Suspensa</option>
              <option value="encerrada">Encerrada</option>
            </Select>
          </Label>
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
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={!form.name || !form.owner}>
          {editing ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </Modal>
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
    <Label className={styles.formGroup}>
      <span className={styles.label}>{label}</span>
      <Input className={styles.input} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </Label>
  );
}
