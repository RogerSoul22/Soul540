import type { PizzaEvent } from './types';

export type EventIssueSeverity = 'info' | 'warning' | 'danger';

export interface EventOperationalIssue {
  key: string;
  label: string;
  severity: EventIssueSeverity;
}

export interface EventOperationalAlert {
  event: PizzaEvent;
  issues: EventOperationalIssue[];
  paymentLabel: string;
  paymentSeverity: EventIssueSeverity;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDay(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function diffDays(date: Date, base: Date): number {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const b = new Date(base.getFullYear(), base.getMonth(), base.getDate()).getTime();
  return Math.round((a - b) / MS_PER_DAY);
}

export function getEventPaymentStatus(event: PizzaEvent): {
  label: string;
  severity: EventIssueSeverity;
} {
  const total = event.finalValue && event.finalValue > 0 ? event.finalValue : event.budget;
  const deposit = event.depositValue ?? 0;

  if (!total || total <= 0) return { label: 'Sem valor', severity: 'warning' };
  if (deposit <= 0) return { label: 'Sem sinal', severity: 'danger' };
  if (deposit >= total) return { label: 'Pago', severity: 'info' };
  return { label: 'Parcial', severity: 'warning' };
}

export function getEventOperationalIssues(event: PizzaEvent, today = new Date()): EventOperationalIssue[] {
  const issues: EventOperationalIssue[] = [];
  const eventDate = toDay(event.date);
  const daysUntil = eventDate ? diffDays(eventDate, today) : null;
  const isNear = daysUntil != null && daysUntil >= 0 && daysUntil <= 14;
  const isActive = event.status !== 'completed' && event.status !== 'cancelled';

  if (!event.location?.trim()) {
    issues.push({ key: 'location', label: 'Sem endereco', severity: 'danger' });
  }

  if (!event.phone?.trim()) {
    issues.push({ key: 'phone', label: 'Sem telefone', severity: 'warning' });
  }

  if (event.status === 'planning' && isNear) {
    issues.push({ key: 'planning', label: 'Ainda em orcamento', severity: 'warning' });
  }

  if (isActive && !(event.contractPdfName || event.contractPdfData)) {
    issues.push({ key: 'contract', label: 'Sem contrato', severity: isNear ? 'danger' : 'warning' });
  }

  if (isActive && (!event.depositValue || event.depositValue <= 0)) {
    issues.push({ key: 'deposit', label: 'Sem sinal', severity: isNear ? 'danger' : 'warning' });
  }

  if (isActive && event.depositValue && event.finalValue && event.depositValue > event.finalValue) {
    issues.push({ key: 'deposit-over-final', label: 'Sinal maior que final', severity: 'danger' });
  }

  if (isActive && event.depositValue && !(event.paymentProofName || event.paymentProofData)) {
    issues.push({ key: 'payment-proof', label: 'Sem comprovante', severity: 'warning' });
  }

  if (isActive && !(event.responsibleEmployeeId || event.teamPizzaiolo || event.selectedEmployeeIds?.length)) {
    issues.push({ key: 'team', label: 'Sem equipe', severity: isNear ? 'danger' : 'warning' });
  }

  const categorizedGuests = (event.guestsAdult ?? 0) + (event.guestsTeen ?? 0) + (event.guestsChild ?? 0);
  if (categorizedGuests > 0 && categorizedGuests !== event.guestCount) {
    issues.push({ key: 'guests', label: 'Convidados nao batem', severity: 'warning' });
  }

  return issues;
}

export function getUpcomingOperationalAlerts(
  events: PizzaEvent[],
  options: { limit?: number; today?: Date; horizonDays?: number } = {},
): EventOperationalAlert[] {
  const today = options.today ?? new Date();
  const horizonDays = options.horizonDays ?? 45;
  const limit = options.limit ?? 5;

  return events
    .filter((event) => event.status !== 'completed' && event.status !== 'cancelled')
    .map((event) => {
      const payment = getEventPaymentStatus(event);
      return {
        event,
        issues: getEventOperationalIssues(event, today),
        paymentLabel: payment.label,
        paymentSeverity: payment.severity,
      };
    })
    .filter((alert) => {
      const date = toDay(alert.event.date);
      if (!date) return alert.issues.length > 0;
      const days = diffDays(date, today);
      return days >= -1 && days <= horizonDays && alert.issues.length > 0;
    })
    .sort((a, b) => {
      const da = toDay(a.event.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = toDay(b.event.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const severityScore = (alert: EventOperationalAlert) =>
        alert.issues.some((i) => i.severity === 'danger') ? 0 : 1;
      return severityScore(a) - severityScore(b) || da - db;
    })
    .slice(0, limit);
}
