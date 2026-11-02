import type { InputHTMLAttributes } from 'react';
import type { DatePickerType } from './date-utils';

export type { DatePickerType };

// date: dia/mês/ano; month: mês/ano. Os valores seguem o formato do <input> nativo (2026-11-04 e 2026-11).
export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type: DatePickerType;
  label?: string;
}
