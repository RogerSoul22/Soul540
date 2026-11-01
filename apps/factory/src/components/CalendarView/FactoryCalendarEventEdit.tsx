import { Button, Input, Textarea } from '../../../../../packages/pentagono/src/index';
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
            <Input
              label="Nome do evento"
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className={styles.formField}>
            <Input
              label="Data"
              type="date"
              value={(form.date ?? '').slice(0, 10)}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <Input
              label="Local"
              value={form.location ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className={styles.formField}>
            <Input
              label="Convidados"
              type="number"
              value={form.guestCount ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, guestCount: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <Input
              label="Orçamento (R$)"
              type="number"
              value={form.budget ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))}
            />
          </div>
        </div>
        <div className={styles.formField}>
          <Textarea
            label="Observações"
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
