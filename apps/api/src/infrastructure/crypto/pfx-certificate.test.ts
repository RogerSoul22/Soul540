import assert from 'node:assert/strict';
import test from 'node:test';
import * as forge from 'node-forge';
import { parsePfxCertificate } from './pfx-certificate';

function makeCertificate(keyPair: forge.pki.rsa.KeyPair, commonName: string) {
  const certificate = forge.pki.createCertificate();
  certificate.publicKey = keyPair.publicKey;
  certificate.serialNumber = '01';
  certificate.validity.notBefore = new Date('2026-01-01T00:00:00.000Z');
  certificate.validity.notAfter = new Date('2030-01-01T00:00:00.000Z');
  certificate.setSubject([{ name: 'commonName', value: commonName }]);
  certificate.setIssuer(certificate.subject.attributes);
  certificate.sign(keyPair.privateKey);
  return certificate;
}

test('selects the certificate that matches the private key in a PFX chain', () => {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });
  const unrelatedKeyPair = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });
  const leaf = makeCertificate(keyPair, 'leaf');
  const issuer = makeCertificate(unrelatedKeyPair, 'issuer');
  const pfxAsn1 = forge.pkcs12.toPkcs12Asn1(keyPair.privateKey, [issuer, leaf], 'secret', {
    algorithm: '3des',
    generateLocalKeyId: true,
  } as any);
  const pfx = forge.util.encode64(forge.asn1.toDer(pfxAsn1).getBytes());

  const parsed = parsePfxCertificate(pfx, 'secret');

  assert.equal(parsed.certificate.subject.attributes[0].value, 'leaf');
});
