import type { PizzaEvent } from '../../../../../packages/contracts/src/index';
import styles from './styles/CalendarView.module.scss';
import { DateField, ListField, NumberField, TextField } from './CalendarEventField';

type Form = Partial<PizzaEvent>;
type Props = {
  form: Form;
  updateForm: (data: Form) => void;
  readNumber: (value: string) => number | undefined;
  readList: (value: string) => string[];
};

export default function CalendarEventOperationsFields({ form, updateForm, readNumber, readList }: Props) {
  return (
    <>
      <div className={styles.formRow}>
        <NumberField
          label="Extras - louças (pessoas)"
          field="extrasLoucas"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
        <NumberField
          label="Extras - bebidas (pessoas)"
          field="extrasBebidas"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
      </div>
      <ListField
        label="Cardápio (separado por vírgula)"
        field="menu"
        form={form}
        updateForm={updateForm}
        readList={readList}
      />
      <div className={styles.formRow}>
        <TextField label="Imagem do local" field="locationImageName" form={form} updateForm={updateForm} />
        <TextField label="Comprovante de pagamento" field="paymentProofName" form={form} updateForm={updateForm} />
      </div>
      <TextField label="Contrato (PDF)" field="contractPdfName" form={form} updateForm={updateForm} />
      <div className={styles.formRow}>
        <TextField label="Nome do evento" field="name" form={form} updateForm={updateForm} />
        <DateField label="Data" field="date" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <TextField label="Local" field="location" form={form} updateForm={updateForm} />
        <NumberField
          label="Convidados"
          field="guestCount"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
      </div>
      <div className={styles.formRow}>
        <NumberField
          label="Orçamento (R$)"
          field="budget"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel}>Observações</label>
        <textarea
          className={styles.formTextarea}
          value={form.notes ?? ''}
          onChange={(event) => updateForm({ notes: event.target.value })}
        />
      </div>
    </>
  );
}
