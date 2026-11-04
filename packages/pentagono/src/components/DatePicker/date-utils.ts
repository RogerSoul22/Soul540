export type DatePickerType = 'date' | 'month';

export interface DateParts {
  year: number;
  // 0 a 11
  month: number;
  day: number;
}

const pad = (value: number) => String(value).padStart(2, '0');

// "2026-11-04" ou "2026-11" -> partes. Sem usar Date, para não sofrer com fuso horário.
export function parseValue(value: string | undefined | null): DateParts | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value ?? '');
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3] ?? 1) };
}

export function toValue(type: DatePickerType, { year, month, day }: DateParts): string {
  return type === 'month' ? `${year}-${pad(month + 1)}` : `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function formatDisplay(type: DatePickerType, value: string | undefined | null): string {
  const parts = parseValue(value);
  if (!parts) return '';
  return type === 'month'
    ? `${pad(parts.month + 1)}/${parts.year}`
    : `${pad(parts.day)}/${pad(parts.month + 1)}/${parts.year}`;
}

// Converte o que a pessoa digitou para o formato ISO usado pelos formulários.
export function parseDisplayInput(type: DatePickerType, input: string): string | null {
  const value = input.trim();
  if (!value) return '';
  if (type === 'date') {
    const match = /^(?:(\d{2})\/(\d{2})\/(\d{4})|(\d{2})(\d{2})(\d{4})|(\d{4})-(\d{2})-(\d{2}))$/.exec(value);
    if (!match) return null;
    const [, dayText, monthText, yearText, compactDay, compactMonth, compactYear, isoYear, isoMonth, isoDay] = match;
    const day = Number(dayText ?? compactDay ?? isoDay);
    const month = Number(monthText ?? compactMonth ?? isoMonth);
    const year = Number(yearText ?? compactYear ?? isoYear);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month - 1)) return null;
    return `${year}-${pad(month)}-${pad(day)}`;
  }
  const match = /^(?:(\d{2})\/(\d{4})|(\d{2})(\d{4})|(\d{4})-(\d{2}))$/.exec(value);
  if (!match) return null;
  const [, monthText, yearText, compactMonth, compactYear, isoYear, isoMonth] = match;
  const month = Number(monthText ?? compactMonth ?? isoMonth);
  const year = Number(yearText ?? compactYear ?? isoYear);
  if (month < 1 || month > 12) return null;
  return `${year}-${pad(month)}`;
}

export const todayParts = (): DateParts => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
};

export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// Soma meses mantendo o dia dentro do mês de destino (31/jan + 1 mês = 28/fev).
export function addMonths(parts: DateParts, amount: number): DateParts {
  const index = parts.year * 12 + parts.month + amount;
  const year = Math.floor(index / 12);
  const month = index - year * 12;
  return { year, month, day: Math.min(parts.day, daysInMonth(year, month)) };
}

export function addDays(parts: DateParts, amount: number): DateParts {
  const date = new Date(parts.year, parts.month, parts.day + amount);
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

export interface GridCell extends DateParts {
  inMonth: boolean;
}

// 6 semanas começando no domingo, com os dias dos meses vizinhos para completar a grade.
export function buildMonthGrid(year: number, month: number): GridCell[] {
  const offset = new Date(year, month, 1).getDay();
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - offset + index);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

// Comparação em texto: o formato ISO ordena igual à data.
export function isOutOfRange(value: string, min?: string, max?: string) {
  return Boolean((min && value < min) || (max && value > max));
}

export const MONTHS_LONG = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2026, month, 1)),
);
export const MONTHS_SHORT = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(2026, month, 1)).replace('.', ''),
);
export const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
