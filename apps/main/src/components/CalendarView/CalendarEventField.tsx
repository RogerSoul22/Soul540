import type { PizzaEvent } from '@soul540/contracts';
import styles from './styles/CalendarView.module.scss';

type Form = Partial<PizzaEvent>;
type Update = (data: Form) => void;
type FieldProps = { label: string; field: keyof PizzaEvent; form: Form; updateForm: Update };

function valueOf(form: Form, field: keyof PizzaEvent) {
  const value = form[field];
  return value == null ? '' : String(value);
}

export function TextField({ label, field, form, updateForm }: FieldProps) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      <input
        className={styles.formInput}
        value={valueOf(form, field)}
        onChange={(event) => updateForm({ [field]: event.target.value } as Form)}
      />
    </div>
  );
}

export function NumberField({
  label,
  field,
  form,
  updateForm,
  readNumber,
}: FieldProps & { readNumber: (value: string) => number | undefined }) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      <input
        type="number"
        className={styles.formInput}
        value={valueOf(form, field)}
        onChange={(event) => updateForm({ [field]: readNumber(event.target.value) } as Form)}
      />
    </div>
  );
}

export function DateField({ label, field, form, updateForm }: FieldProps) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      <input
        type="date"
        className={styles.formInput}
        value={valueOf(form, field).slice(0, 10)}
        onChange={(event) => updateForm({ [field]: event.target.value || undefined } as Form)}
      />
    </div>
  );
}

export function SelectField({
  label,
  field,
  form,
  updateForm,
  options,
}: FieldProps & { options: Array<[string, string]> }) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      <select
        className={styles.formInput}
        value={valueOf(form, field)}
        onChange={(event) => updateForm({ [field]: event.target.value } as Form)}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ListField({
  label,
  field,
  form,
  updateForm,
  readList,
}: FieldProps & { readList: (value: string) => string[] }) {
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label}</label>
      <input
        className={styles.formInput}
        value={Array.isArray(form[field]) ? (form[field] as string[]).join(', ') : valueOf(form, field)}
        onChange={(event) => updateForm({ [field]: readList(event.target.value) } as Form)}
      />
    </div>
  );
}
