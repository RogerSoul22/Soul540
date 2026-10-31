export type EventWhatsAppSummary = {
  phone?: string;
  name: string;
  dateLabel: string;
  time?: string;
  location: string;
  outOfCity?: boolean;
  guestCount?: number;
  budget?: number;
  notes?: string;
  includeIcons?: boolean;
};

export function buildEventWhatsAppUrl(event: EventWhatsAppSummary): string {
  const digits = event.phone?.replace(/\D/g, '') || '';
  if (!digits) return '';

  const prefix = event.includeIcons === false ? '' : '📅 ';
  const locationPrefix = event.includeIcons === false ? '' : '📍 ';
  const guestPrefix = event.includeIcons === false ? '' : '👥 ';
  const amountPrefix = event.includeIcons === false ? '' : '💰 ';
  const notesPrefix = event.includeIcons === false ? '' : '📝 ';

  const lines = [
    `Olá! Segue o resumo do evento *${event.name}*:`,
    '',
    `${prefix}Data: ${event.dateLabel}${event.time ? ` às ${event.time}` : ''}`,
    `${locationPrefix}Local: ${event.location}${event.outOfCity ? ' (fora da cidade)' : ''}`,
    `${guestPrefix}Convidados: ${event.guestCount ?? 0}`,
    `${amountPrefix}Valor: R$ ${(event.budget ?? 0).toLocaleString('pt-BR')}`,
    ...(event.notes ? [`${notesPrefix}Obs: ${event.notes}`] : []),
  ];

  return `https://wa.me/55${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
}
