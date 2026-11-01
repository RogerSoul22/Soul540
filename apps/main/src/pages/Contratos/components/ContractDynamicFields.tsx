import { Input, Label, Textarea } from '../../../../../../packages/pentagono/src/index';
import type { FormData } from '../types/contract-types';
import styles from '../styles/Contratos.module.scss';

type Props = {
  fields: Array<[keyof FormData, string, boolean?]>;
  form: FormData;
  onChange: (field: keyof FormData, value: string) => void;
};
export default function ContractDynamicFields({ fields, form, onChange }: Props) {
  return (
    <>
      {fields.map(([field, label, multiline]) => (
        <div key={field} className={styles.formGroup}>
          <Label className={styles.label}>{label}</Label>
          {multiline ? (
            <Textarea
              className={styles.input}
              rows={2}
              value={String(form[field])}
              onChange={(event) => onChange(field, event.target.value)}
            />
          ) : (
            <Input
              className={styles.input}
              value={String(form[field])}
              onChange={(event) => onChange(field, event.target.value)}
            />
          )}
        </div>
      ))}
    </>
  );
}
