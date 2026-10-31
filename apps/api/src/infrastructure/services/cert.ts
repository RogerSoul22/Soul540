import * as forge from 'node-forge';
import { parsePfxCertificate } from '../crypto/pfx-certificate';
import type { OpenedMainCertificate } from '../../modules/fiscal/main-certificate-types';

export interface CertData {
  keyPem: string;
  certPem: string;
  certDer: string;
}

export function loadCert(certificate: OpenedMainCertificate): CertData {
  const { privateKey, certificate: certObj } = parsePfxCertificate(certificate.pfxBase64, certificate.password);
  const certPem = forge.pki.certificateToPem(certObj);
  return {
    keyPem: forge.pki.privateKeyToPem(privateKey),
    certPem,
    certDer: Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(certObj)).getBytes(), 'binary').toString(
      'base64',
    ),
  };
}
