import assert from 'node:assert/strict';
import test from 'node:test';
import { readLegacyCertificateEnv } from './migrate-main-certificate';

test('reads legacy certificate configuration only when both values exist', () => {
  assert.deepEqual(readLegacyCertificateEnv({ NFE_CERT_BASE64: 'pfx', NFE_CERT_PASSWORD: 'secret' }), {
    certificateBase64: 'pfx',
    password: 'secret',
  });
  assert.equal(readLegacyCertificateEnv({ NFE_CERT_BASE64: 'pfx' }), null);
});

test('does not accept empty legacy values', () => {
  assert.equal(readLegacyCertificateEnv({ NFE_CERT_BASE64: ' ', NFE_CERT_PASSWORD: 'secret' }), null);
  assert.equal(readLegacyCertificateEnv({ NFE_CERT_BASE64: 'pfx', NFE_CERT_PASSWORD: '' }), null);
});
