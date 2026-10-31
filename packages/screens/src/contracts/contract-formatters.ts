export const maskCpf = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
export const maskRg = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 9)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2');
export const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};
export const maskCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const cents = Number.parseInt(digits, 10);
  return `R$ ${Math.floor(cents / 100).toLocaleString('pt-BR')},${String(cents % 100).padStart(2, '0')}`;
};
export const parseCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number.parseInt(digits, 10) / 100 : 0;
};
