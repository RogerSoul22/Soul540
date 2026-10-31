import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventFormModality({ controller }: { controller: EventFormController }) {
  const { form, setForm } = controller;
  return (
    <div className={styles.formGrid2}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Modalidade</label>
        <select
          className={styles.input}
          value={form.modality}
          onChange={(event) => setForm({ ...form, modality: event.target.value as typeof form.modality })}
        >
          <option value="evento_avulso">Evento avulso</option>
          <option value="feirinha">Feirinha semanal</option>
        </select>
      </div>
      {form.modality === 'feirinha' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Recorrência até</label>
          <input
            className={styles.input}
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
