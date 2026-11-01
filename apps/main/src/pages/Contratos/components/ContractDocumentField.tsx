import { Input, Textarea } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentField({
  value,
  onChange,
  editing,
  multiline,
  bold,
  placeholder = '_______________',
}: {
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  multiline?: boolean;
  bold?: boolean;
  placeholder?: string;
}) {
  if (!editing) {
    return (
      <span
        className={styles.fieldView}
        style={{
          fontWeight: bold ? 600 : undefined,
          whiteSpace: multiline ? 'pre-wrap' : undefined,
        }}
      >
        {value || placeholder}
      </span>
    );
  }

  if (multiline) {
    return (
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.fieldTextarea}
        rows={3}
      />
    );
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={styles.fieldInput}
      style={{ fontWeight: bold ? 600 : undefined }}
    />
  );
}
