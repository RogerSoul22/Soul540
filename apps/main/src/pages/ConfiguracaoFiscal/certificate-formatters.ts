export function formatCertificateDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '—';
}

export function getCertificateDaysRemaining(value?: string) {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
}
