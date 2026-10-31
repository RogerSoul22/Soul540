import * as forge from 'node-forge';
import { parsePfxCertificate } from '../../infrastructure/crypto/pfx-certificate';

export interface CertificateInspection {
  validUntil: Date;
  certificateCnpj?: string;
  certificateHolder?: string;
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

function attributeValue(certificate: forge.pki.Certificate, shortName: string): string {
  const attribute = certificate.subject.attributes.find((item) => item.shortName === shortName);
  return String(attribute?.value ?? '');
}

export function extractCertificateInspection(certificate: forge.pki.Certificate): CertificateInspection {
  const commonName = attributeValue(certificate, 'CN');
  const organization = attributeValue(certificate, 'O');
  const serialNumber = digits(attributeValue(certificate, 'serialNumber'));
  const commonNameCnpj = digits(commonName).length === 14 ? digits(commonName) : undefined;
  return {
    validUntil: certificate.validity.notAfter,
    certificateCnpj: serialNumber.length === 14 ? serialNumber : commonNameCnpj,
    certificateHolder: commonName || organization || undefined,
  };
}

export function inspectPfx(certificateBase64: string, password: string): CertificateInspection {
  try {
    return extractCertificateInspection(parsePfxCertificate(certificateBase64, password).certificate);
  } catch {
    throw new Error('Não foi possível ler o certificado A1. Verifique o arquivo e a senha.');
  }
}
