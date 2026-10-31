import type { PizzaEvent } from '@soul540/contracts';
import styles from './styles/CalendarView.module.scss';
import CalendarEventBasicsFields from './CalendarEventBasicsFields';
import CalendarEventOperationsFields from './CalendarEventOperationsFields';

type Form = Partial<PizzaEvent>;
type Props = {
  form: Form;
  updateForm: (data: Form) => void;
  readNumber: (value: string) => number | undefined;
  readList: (value: string) => string[];
  onCancel: () => void;
  onSave: () => void;
};

export default function CalendarEventEditPanel({ form, updateForm, readNumber, readList, onCancel, onSave }: Props) {
  const status = form.status;
  return (
    <>
      <div className={styles.panelBody}>
        <div className={styles.statusToggle}>
          {(
            [
              ['planning', 'Orçamento'],
              ['confirmed', 'Fechado'],
              ['completed', 'Finalizado'],
              ['cancelled', 'Cancelado'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={styles.statusBtn + ' ' + (status === value ? styles.statusBtnActive : '')}
              onClick={() => updateForm({ status: value })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.editFields}>
          <CalendarEventBasicsFields form={form} updateForm={updateForm} readNumber={readNumber} readList={readList} />
          <CalendarEventOperationsFields
            form={form}
            updateForm={updateForm}
            readNumber={readNumber}
            readList={readList}
          />
        </div>
      </div>
      <div className={styles.panelActions}>
        <button className={styles.btnCancel} onClick={onCancel}>
          Cancelar
        </button>
        <button className={styles.btnSave} onClick={onSave}>
          Salvar
        </button>
      </div>
    </>
  );
}
