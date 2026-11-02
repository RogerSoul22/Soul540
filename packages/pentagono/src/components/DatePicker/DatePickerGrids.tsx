import styles from './DatePickerPanel.module.css';
import {
  buildMonthGrid,
  capitalize,
  isOutOfRange,
  MONTHS_SHORT,
  toValue,
  WEEKDAYS,
  type DateParts,
  type DatePickerType,
} from './date-utils';

export const sameDate = (left: DateParts, right: DateParts | null, compareDay = true) =>
  Boolean(right && left.year === right.year && left.month === right.month && (!compareDay || left.day === right.day));

interface GridProps {
  cursor: DateParts;
  selected: DateParts | null;
  today: DateParts;
  min?: string;
  max?: string;
}

// Grade de 12 meses do ano em foco (no tipo "month" já escolhe; no "date" volta para os dias).
export function MonthsGrid({
  cursor,
  selected,
  today,
  min,
  max,
  type,
  onPickMonth,
}: GridProps & { type: DatePickerType; onPickMonth: (value: DateParts) => void }) {
  return (
    <div className={styles.months}>
      {MONTHS_SHORT.map((label, month) => {
        const candidate = { ...cursor, month };
        const disabled = isOutOfRange(toValue('month', candidate), min?.slice(0, 7), max?.slice(0, 7));
        const classes = [
          styles.month,
          sameDate(candidate, selected, false) && styles.selected,
          sameDate(candidate, today, false) && styles.today,
        ];
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            className={classes.filter(Boolean).join(' ')}
            onClick={() => onPickMonth(candidate)}
            data-type={type}
          >
            {capitalize(label)}
          </button>
        );
      })}
    </div>
  );
}

// Dias do mês em foco (6 semanas, com os dias dos meses vizinhos esmaecidos).
export function DaysGrid({
  cursor,
  selected,
  today,
  min,
  max,
  onPick,
}: GridProps & { onPick: (value: string) => void }) {
  return (
    <>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      <div className={styles.days}>
        {buildMonthGrid(cursor.year, cursor.month).map((cell) => {
          const value = toValue('date', cell);
          const classes = [
            styles.day,
            !cell.inMonth && styles.outside,
            sameDate(cell, selected) && styles.selected,
            sameDate(cell, today) && styles.today,
            sameDate(cell, cursor) && styles.focused,
          ];
          return (
            <button
              key={value}
              type="button"
              disabled={isOutOfRange(value, min, max)}
              className={classes.filter(Boolean).join(' ')}
              onClick={() => onPick(value)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </>
  );
}
