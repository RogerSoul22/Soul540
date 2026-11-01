import { Input, Select } from '../../../../../../packages/pentagono/src/index';
import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventFormModality({ controller }: { controller: EventFormController }) {
  const { form, setForm } = controller;
  return (
    <div className={styles.formGrid2}>
      <div className={styles.formGroup}>
        <Select
          label="Modalidade"
          value={form.modality}
          onChange={(event) => setForm({ ...form, modality: event.target.value as typeof form.modality })}
        >
          <option value="evento_avulso">Evento avulso</option>
          <option value="feirinha">Feirinha semanal</option>
        </Select>
      </div>
      {form.modality === 'feirinha' && (
        <div className={styles.formGroup}>
          <Input
            label="Recorrência até"
            type="date"
            value={form.recurrenceEndDate}
            min={form.date || undefined}
            onChange={(event) => setForm({ ...form, recurrenceEndDate: event.target.value })}
          />
        </div>
      )}
    </div>
  );
}
