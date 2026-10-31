export function encodeCertificateBytes(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function isCertificateFile(name: string): boolean {
  return /\.(pfx|p12)$/i.test(name);
}
