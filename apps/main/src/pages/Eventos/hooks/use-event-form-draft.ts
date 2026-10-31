import { useMemo } from 'react';
import type { PizzaEvent } from '@soul540/contracts';
import type { EventFormData } from '../types/event-form-types';

export function useEventFormDraft(form: EventFormData) {
  return useMemo<Partial<PizzaEvent>>(
    () => ({
      date: form.date,
      guestCount: Number(form.guestCount) || 0,
      guestsAdult: Number(form.guestsAdult) || undefined,
      guestsTeen: Number(form.guestsTeen) || undefined,
      guestsChild: Number(form.guestsChild) || undefined,
      menu: form.menu
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      selectedEmployeeIds: form.selectedEmployeeIds,
      responsibleEmployeeId: form.responsibleEmployeeId || undefined,
      teamPizzaiolo: form.teamPizzaiolo || undefined,
      teamHelper: form.teamHelper || undefined,
      teamGarcon: form.teamGarcon || undefined,
      estimatedPizzas: Number(form.estimatedPizzas) || undefined,
    }),
    [form],
  );
}
