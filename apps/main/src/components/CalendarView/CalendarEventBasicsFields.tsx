import type { PizzaEvent } from '@soul540/contracts';
import styles from './styles/CalendarView.module.scss';
import { DateField, ListField, NumberField, SelectField, TextField } from './CalendarEventField';
type Form = Partial<PizzaEvent>;
type Props = {
  form: Form;
  updateForm: (data: Form) => void;
  readNumber: (value: string) => number | undefined;
  readList: (value: string) => string[];
};

export default function CalendarEventBasicsFields({ form, updateForm, readNumber, readList }: Props) {
  return (
    <>
      <div className={styles.formRow}>
        <TextField label="Criado por" field="createdBy" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <TextField label="O que estamos celebrando" field="celebration" form={form} updateForm={updateForm} />
        <DateField label="Data final" field="endDate" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <TextField label="Horário de início" field="time" form={form} updateForm={updateForm} />
        <TextField label="Equipe chega" field="teamArrivalTime" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <TextField label="Duração" field="duration" form={form} updateForm={updateForm} />
        <TextField label="Cidade" field="city" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <TextField label="Telefone" field="phone" form={form} updateForm={updateForm} />
        <SelectField
          label="Fora da cidade"
          field="outOfCity"
          form={{ ...form, outOfCity: form.outOfCity ? 'yes' : 'no' } as unknown as Form}
          updateForm={(data) => updateForm({ outOfCity: String(data.outOfCity) === 'yes' })}
          options={[
            ['no', 'Não'],
            ['yes', 'Sim'],
          ]}
        />
      </div>
      <div className={styles.formRow}>
        <NumberField
          label="Acima de 12 anos"
          field="guestsAdult"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
        <NumberField
          label="De 8 até 12 anos"
          field="guestsTeen"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
      </div>
      <div className={styles.formRow}>
        <NumberField
          label="Abaixo de 7 anos"
          field="guestsChild"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
        <NumberField
          label="Deslocamento (R$)"
          field="travelCost"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
      </div>
      <div className={styles.formRow}>
        <NumberField
          label="Valor final (R$)"
          field="finalValue"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
        <NumberField
          label="Sinal recebido (R$)"
          field="depositValue"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
      </div>
      <div className={styles.formRow}>
        <SelectField
          label="Forma de pagamento"
          field="paymentMethod"
          form={form}
          updateForm={updateForm}
          options={[
            ['', 'Selecionar'],
            ['pix_parcelado', 'Pix - 30% na reserva e restante até o dia'],
            ['cartao', 'Cartão - até 2x sem juros na reserva'],
            ['pix_total', 'Pix - valor total'],
            ['outro', 'Outro'],
          ]}
        />
        <TextField label="Chave PIX" field="pixKey" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <NumberField
          label="Estimado (pizzas)"
          field="estimatedPizzas"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
        <NumberField
          label="Realizado (pizzas)"
          field="actualPizzas"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
      </div>
      <div className={styles.formRow}>
        <TextField label="Pizzaiolo(a)" field="teamPizzaiolo" form={form} updateForm={updateForm} />
        <TextField label="Ajudante" field="teamHelper" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <TextField label="Garçom" field="teamGarcon" form={form} updateForm={updateForm} />
        <TextField label="Funcionário responsável" field="responsibleEmployeeId" form={form} updateForm={updateForm} />
      </div>
      <div className={styles.formRow}>
        <NumberField
          label="Funcionários no evento"
          field="staffCount"
          form={form}
          updateForm={updateForm}
          readNumber={readNumber}
        />
        <ListField
          label="Equipe escalada (IDs separados por vírgula)"
          field="selectedEmployeeIds"
          form={form}
          updateForm={updateForm}
          readList={readList}
        />
      </div>
    </>
  );
}
