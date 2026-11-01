import { Button } from '../../../../../packages/pentagono/src/index';
import type { PizzaEvent } from '../../../../../packages/contracts/src/index';
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
            <Button
              variant="chip"
              key={value}
              type="button"
              className={styles.statusBtn + ' ' + (status === value ? styles.statusBtnActive : '')}
              onClick={() => updateForm({ status: value })}
            >
              {label}
            </Button>
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
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave}>
          Salvar
        </Button>
      </div>
    </>
  );
}
