import assert from 'node:assert/strict';
import test from 'node:test';
import { SecretCipher } from '../../infrastructure/crypto/secret-cipher';
import { MainCertificateService, type MainCertificateModelLike } from './main-certificate.service';
import type { MainCertificateRecord } from './main-certificate.model';

const KEY = 'b'.repeat(64);
const VALID_UNTIL = new Date('2030-01-01T00:00:00.000Z');

type MemoryRecord = MainCertificateRecord & Record<string, any>;

class MemoryCertificateModel implements MainCertificateModelLike {
  record: MemoryRecord | null = null;

  async findOne(_filter: Record<string, unknown>): Promise<MainCertificateRecord | null> {
    return this.record ? { ...this.record } : null;
  }

  async create(value: Record<string, unknown>): Promise<MainCertificateRecord> {
    this.record = { key: 'main', legacyMigrationCompleted: false, ...value } as MainCertificateRecord;
    return { ...this.record };
  }

  async findOneAndUpdate(
    _filter: Record<string, unknown>,
    update: Record<string, any>,
  ): Promise<MainCertificateRecord> {
    this.record = { ...(this.record ?? { _id: 'main-cert', key: 'main', legacyMigrationCompleted: false }) };
    if (update.$set) Object.assign(this.record, update.$set);
    if (update.$unset) Object.keys(update.$unset).forEach((key) => delete this.record?.[key]);
    return { ...this.record } as MainCertificateRecord;
  }
}

function buildService(model = new MemoryCertificateModel()) {
  return {
    model,
    service: new MainCertificateService({
      model,
      cipher: new SecretCipher(KEY),
      inspect: (_base64, _password) => ({
        validUntil: VALID_UNTIL,
        certificateCnpj: '12345678000199',
        certificateHolder: 'Soul Matriz',
      }),
      now: () => new Date('2026-10-26T00:00:00.000Z'),
    }),
  };
}

test('saves the certificate encrypted and returns only its summary', async () => {
  const { service, model } = buildService();
  const summary = await service.saveMainCertificate({ certificateBase64: 'pfx-base64', password: 'secret' });

  assert.equal(summary.configured, true);
  assert.equal(summary.certificateHolder, 'Soul Matriz');
  assert.equal(model.record?.pfxEncrypted === 'pfx-base64', false);
  assert.equal(model.record?.passwordEncrypted === 'secret', false);
  assert.equal('pfxEncrypted' in summary, false);
  assert.equal('passwordEncrypted' in summary, false);
});

test('opens the certificate only for backend use', async () => {
  const { service } = buildService();
  await service.saveMainCertificate({ certificateBase64: 'pfx-base64', password: 'secret' });

  const opened = await service.openMainCertificate();

  assert.deepEqual(opened, {
    pfxBase64: 'pfx-base64',
    password: 'secret',
    validUntil: VALID_UNTIL,
    certificateCnpj: '12345678000199',
    certificateHolder: 'Soul Matriz',
  });
});

test('rejects invalid or expired certificates before persistence', async () => {
  const model = new MemoryCertificateModel();
  const service = new MainCertificateService({
    model,
    cipher: new SecretCipher(KEY),
    inspect: () => ({ validUntil: new Date('2020-01-01T00:00:00.000Z') }),
    now: () => new Date('2026-10-26T00:00:00.000Z'),
  });

  await assert.rejects(service.saveMainCertificate({ certificateBase64: 'bad', password: 'bad' }), /expirado/);
  assert.equal(model.record, null);
});

test('removes the certificate without allowing legacy reimport', async () => {
  const { service } = buildService();
  await service.saveMainCertificate({ certificateBase64: 'pfx-base64', password: 'secret' });
  process.env.NFE_CERT_BASE64 = 'legacy-pfx';
  process.env.NFE_CERT_PASSWORD = 'legacy-secret';

  await service.removeMainCertificate();
  await service.ensureLegacyMainCertificateImported();

  assert.equal((await service.getMainCertificateSummary()).configured, false);
  delete process.env.NFE_CERT_BASE64;
  delete process.env.NFE_CERT_PASSWORD;
});

test('imports configured legacy environment values only once', async () => {
  const { service } = buildService();
  process.env.NFE_CERT_BASE64 = 'legacy-pfx';
  process.env.NFE_CERT_PASSWORD = 'legacy-secret';

  await service.ensureLegacyMainCertificateImported();
  const first = await service.openMainCertificate();
  process.env.NFE_CERT_BASE64 = 'another-pfx';
  process.env.NFE_CERT_PASSWORD = 'another-secret';
  await service.ensureLegacyMainCertificateImported();
  const second = await service.openMainCertificate();

  assert.equal(first.pfxBase64, 'legacy-pfx');
  assert.equal(second.pfxBase64, 'legacy-pfx');
  delete process.env.NFE_CERT_BASE64;
  delete process.env.NFE_CERT_PASSWORD;
});

test('does not overwrite an existing certificate during legacy migration', async () => {
  const { service, model } = buildService();
  await service.saveMainCertificate({ certificateBase64: 'current-pfx', password: 'current-secret' });
  model.record!.legacyMigrationCompleted = false;
  process.env.NFE_CERT_BASE64 = 'legacy-pfx';
  process.env.NFE_CERT_PASSWORD = 'legacy-secret';

  await service.ensureLegacyMainCertificateImported();

  assert.equal((await service.openMainCertificate()).pfxBase64, 'current-pfx');
  delete process.env.NFE_CERT_BASE64;
  delete process.env.NFE_CERT_PASSWORD;
});
