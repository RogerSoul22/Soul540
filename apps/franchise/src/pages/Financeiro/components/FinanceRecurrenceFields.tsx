import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FranchiseFinanceController } from '../types/finance-controller-types';
import styles from '../styles/Financeiro.module.scss';

export default function FinanceRecurrenceFields({ controller }: { controller: FranchiseFinanceController }) {
  const {
    formInstallments,
    setFormInstallments,
    formRecurring,
    setFormRecurring,
    formRecurrenceFrequency,
    setFormRecurrenceFrequency,
    formRecurrenceInterval,
    setFormRecurrenceInterval,
    formRecurrenceTotal,
    setFormRecurrenceTotal,
    recurrencePreview,
    formAmount,
    formatBRL,
  } = controller;
  return (
    <div className={styles.formSection}>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Parcelar em quantas vezes?</label>
          <input
            type="number"
            min="1"
            max="60"
            className={styles.formInput}
            value={formInstallments}
            onChange={(event) => {
              setFormInstallments(event.target.value);
              if (Number(event.target.value) > 1) setFormRecurring(false);
            }}
          />
          <p className={styles.formHint}>1 = à vista. Acima disso gera parcelas mensais (1/N, 2/N...).</p>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>
            <span>
              <input
                type="checkbox"
                checked={formRecurring}
                onChange={(event) => {
                  setFormRecurring(event.target.checked);
                  if (event.target.checked) setFormInstallments('1');
                }}
                disabled={Number(formInstallments) > 1}
                style={{ marginRight: 6 }}
              />
              Lançamento recorrente
            </span>
          </label>
          {formRecurring && (
            <div className={styles.recurrenceConfig}>
              <label>
                Repetir a cada
                <input
                  type="number"
                  min="1"
                  max="365"
                  className={styles.formInput}
                  value={formRecurrenceInterval}
                  onChange={(event) => setFormRecurrenceInterval(event.target.value)}
                />
              </label>
              <label>
                Frequência
                <select
                  className={styles.formSelect}
                  value={formRecurrenceFrequency}
                  onChange={(event) => setFormRecurrenceFrequency(event.target.value as typeof formRecurrenceFrequency)}
                >
                  <option value="daily">Dia(s)</option>
                  <option value="monthly">Mensal</option>
                  <option value="weekly">Semanal</option>
                  <option value="yearly">Anual</option>
                </select>
              </label>
              <label>
                Terminar após
                <input
                  type="number"
                  min="1"
                  max="366"
                  className={styles.formInput}
                  value={formRecurrenceTotal}
                  onChange={(event) => setFormRecurrenceTotal(event.target.value)}
                />
              </label>
              <div className={styles.recurrenceSummary}>
                <strong>Recorrências previstas</strong>
                <span>
                  {recurrencePreview.length} lançamentos ·{' '}
                  {formatBRL((Number(formAmount.replace(/\D/g, '')) / 100) * recurrencePreview.length)}
                </span>
                <small>
                  {recurrencePreview
                    .slice(0, 4)
                    .map((date) =>
                      format(new Date(`${date}T12:00:00`), 'dd/MM/yyyy', {
                        locale: ptBR,
                      }),
                    )
                    .join(' · ')}
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
