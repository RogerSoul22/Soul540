import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventFormGuests({ controller }: { controller: EventFormController }) {
  const { form, setForm, formatBudget, formSupplyForecast } = controller;
  return (
    <>
      {/* — Convidados — */}
      <div className={styles.formSection}>
        <p className={styles.formSectionTitle}>Convidados</p>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Total de Convidados</label>
            <input
              className={styles.input}
              type="number"
              value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Acima de 12 anos</label>
            <input
              className={styles.input}
              type="number"
              value={form.guestsAdult}
              onChange={(e) => setForm({ ...form, guestsAdult: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>De 8 até 12 anos</label>
            <input
              className={styles.input}
              type="number"
              value={form.guestsTeen}
              onChange={(e) => setForm({ ...form, guestsTeen: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Abaixo de 7 anos</label>
            <input
              className={styles.input}
              type="number"
              value={form.guestsChild}
              onChange={(e) => setForm({ ...form, guestsChild: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        {(() => {
          const total = Number(form.guestCount) || 0;
          const categorized =
            (Number(form.guestsAdult) || 0) + (Number(form.guestsTeen) || 0) + (Number(form.guestsChild) || 0);
          if (total === 0 && categorized === 0) return null;
          const diff = total - categorized;
          return (
            <div
              className={`${styles.guestSummary} ${
                diff < 0 ? styles.guestSummaryOver : diff === 0 ? styles.guestSummaryOk : styles.guestSummaryPending
              }`}
            >
              <span className={styles.guestSummaryTotal}>
                {categorized} / {total} categorizados
              </span>
              {diff > 0 && <span className={styles.guestSummaryDiff}>faltam {diff}</span>}
              {diff < 0 && <span className={styles.guestSummaryDiff}>{Math.abs(diff)} acima do total</span>}
              {diff === 0 && <span className={styles.guestSummaryDiff}>✓ completo</span>}
            </div>
          );
        })()}
      </div>
    </>
  );
}
