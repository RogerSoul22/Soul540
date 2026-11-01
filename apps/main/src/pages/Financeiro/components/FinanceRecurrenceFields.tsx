import { Input, Label, Select } from '../../../../../../packages/pentagono/src/index';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyPtBr as formatBRL } from '../../../../../../packages/domain/src/index';
import type { RecurrenceFrequency } from '../../../../../../packages/contracts/src/index';
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
            <Input
              label="Parcelar em quantas vezes?"
              type="number"
              min="1"
              max="60"
              value={formInstallments}
              onChange={(event) => {
                setFormInstallments(event.target.value);
                if (Number(event.target.value) > 1) setFormRecurring(false);
              }}
            />
            <p className={styles.formHint}>1 = lançamento único</p>
          </div>
          <div className={styles.formField}>
            <Label className={styles.recurrenceToggle}>
              <Input
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
            </Label>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.formSection}>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <Input
            label="Parcelar em quantas vezes?"
            type="number"
            min="1"
            max="60"
            value={formInstallments}
            onChange={(event) => {
              setFormInstallments(event.target.value);
              if (Number(event.target.value) > 1) setFormRecurring(false);
            }}
          />
        </div>
        <Label className={styles.recurrenceToggle}>
          <Input
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
        </Label>
      </div>
      {formRecurring && (
        <div className={styles.recurrencePanel}>
          <div className={styles.recurrenceFields}>
            <Label>
              <span>Repetir a cada</span>
              <Input
                type="number"
                min="1"
                max="365"
                className={styles.formInput}
                value={formRecurrenceInterval}
                onChange={(event) => setFormRecurrenceInterval(event.target.value)}
              />
            </Label>
            <Label>
              <span>Frequência</span>
              <Select
                className={styles.formSelect}
                value={formRecurrenceFrequency}
                onChange={(event) => setFormRecurrenceFrequency(event.target.value as RecurrenceFrequency)}
              >
                <option value="daily">Dia(s)</option>
                <option value="weekly">Semana(s)</option>
                <option value="monthly">Mês(es)</option>
                <option value="yearly">Ano(s)</option>
              </Select>
            </Label>
            <Label>
              <span>Terminar após</span>
              <span className={styles.occurrenceInput}>
                <Input
                  type="number"
                  min="1"
                  max="366"
                  className={styles.formInput}
                  value={formRecurrenceTotal}
                  onChange={(event) => setFormRecurrenceTotal(event.target.value)}
                />
                <span>ocorrências</span>
              </span>
            </Label>
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
