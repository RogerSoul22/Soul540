/** Format an ISO date string as dd/MM/yyyy. */
export function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.substring(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
