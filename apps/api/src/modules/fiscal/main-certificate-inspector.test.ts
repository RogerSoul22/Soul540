import assert from 'node:assert/strict';
import test from 'node:test';
import { extractCertificateInspection } from './main-certificate-inspector';

test('extracts holder, CNPJ and expiry from certificate subject', () => {
  const result = extractCertificateInspection({
    subject: {
      attributes: [
        { shortName: 'CN', value: 'Soul Matriz' },
        { shortName: 'serialNumber', value: '12.345.678/0001-99' },
      ],
    },
    validity: { notAfter: new Date('2030-01-01T00:00:00.000Z') },
  } as any);

  assert.deepEqual(result, {
    validUntil: new Date('2030-01-01T00:00:00.000Z'),
    certificateCnpj: '12345678000199',
    certificateHolder: 'Soul Matriz',
  });
});
