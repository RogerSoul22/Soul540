import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '@soul540/domain';
import type { RecurrenceFrequency } from '@soul540/contracts';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import styles from '../styles/Financeiro.module.scss';
export default function FinanceRecurrenceFields({
  controller,
  visible,
}: {
  controller: FinanceiroController;
  visible: boolean;
}) {
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
  } = controller;
  if (!visible && !formRecurring) {
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
            <p className={styles.formHint}>1 = lançamento único</p>
          </div>
          <div className={styles.formField}>
            <label className={styles.recurrenceToggle}>
              <input
                type="checkbox"
                checked={formRecurring}
                onChange={(event) => {
                  setFormRecurring(event.target.checked);
                  if (event.target.checked) setFormInstallments('1');
                }}
                disabled={Number(formInstallments) > 1}
              />
              <span>
                <strong>Repetir lançamento</strong>
                <small>Crie automaticamente as próximas ocorrências.</small>
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  }
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
        </div>
        <label className={styles.recurrenceToggle}>
          <input
            type="checkbox"
            checked={formRecurring}
            onChange={(event) => {
              setFormRecurring(event.target.checked);
              if (event.target.checked) setFormInstallments('1');
            }}
            disabled={Number(formInstallments) > 1}
          />
          <span>
            <strong>Repetir lançamento</strong>
            <small>Crie automaticamente as próximas ocorrências.</small>
          </span>
        </label>
      </div>
      {formRecurring && (
        <div className={styles.recurrencePanel}>
          <div className={styles.recurrenceFields}>
            <label>
              <span>Repetir a cada</span>
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
              <span>Frequência</span>
              <select
                className={styles.formSelect}
                value={formRecurrenceFrequency}
                onChange={(event) => setFormRecurrenceFrequency(event.target.value as RecurrenceFrequency)}
              >
                <option value="daily">Dia(s)</option>
                <option value="weekly">Semana(s)</option>
                <option value="monthly">Mês(es)</option>
                <option value="yearly">Ano(s)</option>
              </select>
            </label>
            <label>
              <span>Terminar após</span>
              <span className={styles.occurrenceInput}>
                <input
                  type="number"
                  min="1"
                  max="366"
                  className={styles.formInput}
                  value={formRecurrenceTotal}
                  onChange={(event) => setFormRecurrenceTotal(event.target.value)}
                />
                <span>ocorrências</span>
              </span>
            </label>
          </div>
          <div className={styles.recurrencePreview}>
            <div>
              <strong>Recorrência</strong>
              <span>
                {recurrencePreview.length} lançamentos ·{' '}
                {formatBRL((Number(formAmount.replace(/\D/g, '')) / 100) * recurrencePreview.length)}
              </span>
            </div>
            <div className={styles.recurrenceDates}>
              {recurrencePreview.slice(0, 6).map((date, index) => (
                <span key={date + '-' + index}>
                  {index + 1}. {format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              ))}
              {recurrencePreview.length > 6 && <span>+ {recurrencePreview.length - 6} ocorrências</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
