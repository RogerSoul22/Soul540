import * as forge from 'node-forge';

export interface CertData {
  keyPem: string;
  certPem: string;
  certDer: string; // base64 DER — usado no XML de assinatura
}

let _cached: CertData | null = null;

export function loadCert(): CertData {
  if (_cached) return _cached;

  const base64 = process.env.NFE_CERT_BASE64;
  const password = process.env.NFE_CERT_PASSWORD ?? '';

  if (!base64) throw new Error('NFE_CERT_BASE64 não configurado.');

  const pfxDer = Buffer.from(base64, 'base64');
  const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxDer));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, password);

  let keyObj: forge.pki.rsa.PrivateKey | null = null;
  let certObj: forge.pki.Certificate | null = null;

  for (const safeContents of pfx.safeContents) {
    for (const safeBag of safeContents.safeBags) {
      if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag && safeBag.key) {
        keyObj = safeBag.key as forge.pki.rsa.PrivateKey;
      }
      if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) {
        certObj = safeBag.cert;
      }
    }
  }

  if (!keyObj || !certObj) throw new Error('Certificado ou chave privada não encontrados no .pfx.');

  const keyPem = forge.pki.privateKeyToPem(keyObj);
  const certPem = forge.pki.certificateToPem(certObj);
  const certDer = Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(certObj)).getBytes(), 'binary').toString('base64');

  _cached = { keyPem, certPem, certDer };
  return _cached;
}

export function checkCertValidity(): { valid: boolean; expiresAt: Date; daysLeft: number } {
  const cert = loadCert();
  const parsed = forge.pki.certificateFromPem(cert.certPem);
  const expiresAt = parsed.validity.notAfter;
  const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / 86400000);
  return { valid: daysLeft > 0, expiresAt, daysLeft };
}
