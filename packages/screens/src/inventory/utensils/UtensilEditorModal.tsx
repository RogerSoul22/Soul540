import type { UtensilForm } from './utensil-types';
import { formatCurrency } from './currency';
import InventoryModalFrame from './InventoryModalFrame';
import frameStyles from './styles/InventoryModalFrame.module.scss';
import styles from './styles/UtensilEditorModal.module.scss';

interface UtensilEditorModalProps {
  categories: string[];
  editingId: string | null;
  form: UtensilForm;
  isOpen: boolean;
  onChange: (form: UtensilForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function UtensilEditorModal({
  categories,
  editingId,
  form,
  isOpen,
  onChange,
  onClose,
  onSubmit,
}: UtensilEditorModalProps) {
  if (!isOpen) return null;

  const update = <Field extends keyof UtensilForm>(field: Field, value: UtensilForm[Field]) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <InventoryModalFrame
      footer={
        <>
          <button className={frameStyles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button className={frameStyles.primaryButton} onClick={onSubmit} disabled={!form.name}>
            {editingId ? 'Salvar' : 'Adicionar'}
          </button>
        </>
      }
      onClose={onClose}
      title={editingId ? 'Editar Utensílio' : 'Novo Utensílio'}
    >
      <div className={styles.grid}>
        <FormGroup label="Nome *">
          <input
            className={styles.input}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Ex: Forno a Lenha 120cm"
          />
        </FormGroup>
        <FormGroup label="Categoria">
          <select
            className={styles.input}
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
          >
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormGroup>
      </div>
      <div className={styles.grid}>
        <FormGroup label="Quantidade">
          <input
            className={styles.input}
            type="number"
            min="0"
            value={form.quantity}
            onChange={(event) => update('quantity', event.target.value)}
          />
        </FormGroup>
        <FormGroup label="Valor unitário (R$)">
          <input
            className={styles.input}
            type="text"
            value={form.unitValue}
            onChange={(event) => update('unitValue', formatCurrency(event.target.value))}
            placeholder="R$ 0,00"
          />
        </FormGroup>
      </div>
      <div className={styles.grid}>
        <FormGroup label="Localização">
          <input
            className={styles.input}
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
            placeholder="Ex: Depósito"
          />
        </FormGroup>
        <FormGroup label="Status">
          <select
            className={styles.input}
            value={form.status}
            onChange={(event) => update('status', event.target.value as UtensilForm['status'])}
          >
            <option value="disponivel">Disponível</option>
            <option value="em_uso">Em Uso</option>
            <option value="manutencao">Manutenção</option>
            <option value="descartado">Descartado</option>
          </select>
        </FormGroup>
      </div>
    </InventoryModalFrame>
  );
}

function FormGroup({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className={styles.group}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}
