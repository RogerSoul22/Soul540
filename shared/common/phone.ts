/** Format a phone number to WhatsApp-compatible digits only. */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}
