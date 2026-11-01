import type { InputHTMLAttributes, ReactNode } from 'react';

// checkbox: caixa simples; switch: interruptor (preferências); card: opção em caixa selecionável.
export type CheckboxVariant = 'checkbox' | 'switch' | 'card';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  variant?: CheckboxVariant;
}
