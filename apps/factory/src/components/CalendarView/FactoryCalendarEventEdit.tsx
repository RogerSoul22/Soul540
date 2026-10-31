import type { Dispatch, SetStateAction } from 'react';
import type { PizzaEvent } from '../../../../../packages/contracts/src/index';
import styles from './styles/CalendarView.module.scss';

export function FactoryCalendarEventEdit({
  form,
  setForm,
  onCancel,
  onSave,
}: {
  form: Partial<PizzaEvent>;
  setForm: Dispatch<SetStateAction<Partial<PizzaEvent>>>;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className={styles.panelBody}>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Nome do evento</label>
            <input
              className={styles.formInput}
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Data</label>
            <input
              type="date"
              className={styles.formInput}
              value={(form.date ?? '').slice(0, 10)}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Local</label>
            <input
              className={styles.formInput}
              value={form.location ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Convidados</label>
            <input
              type="number"
              className={styles.formInput}
              value={form.guestCount ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, guestCount: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Orçamento (R$)</label>
            <input
              type="number"
              className={styles.formInput}
              value={form.budget ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Observações</label>
          <textarea
            className={styles.formTextarea}
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
