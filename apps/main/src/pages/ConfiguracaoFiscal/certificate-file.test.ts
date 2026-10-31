import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeCertificateBytes, isCertificateFile } from './certificate-file';

test('encodes certificate bytes as base64 without changing them', () => {
  assert.equal(encodeCertificateBytes(new Uint8Array([0, 255, 1]).buffer), 'AP8B');
});

test('accepts only PFX and P12 certificate files', () => {
  assert.equal(isCertificateFile('certificado.PFX'), true);
  assert.equal(isCertificateFile('certificado.p12'), true);
  assert.equal(isCertificateFile('certificado.pdf'), false);
});
