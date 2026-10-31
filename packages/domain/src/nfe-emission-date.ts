export function getNfeEmissionDate(
  rawDate: string,
  fallbackDate: string = new Date().toISOString().slice(0, 10),
): string {
  if (!rawDate) return fallbackDate;

  const compactDate = rawDate.replace(/-/g, '').replace(/T.*/, '');
  if (compactDate.length === 8) {
    return `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`;
  }

  return rawDate.split('T')[0] ?? fallbackDate;
}
