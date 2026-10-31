import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import test from 'node:test';
import { createMainCertificateRouter } from './main-certificate.routes';

const summary = {
  configured: true,
  configuredAt: '2026-10-26T00:00:00.000Z',
  validUntil: '2030-01-01T00:00:00.000Z',
  certificateCnpj: '12345678000199',
  certificateHolder: 'Soul Matriz',
};

class FakeService {
  saved: Record<string, string> | null = null;
  removed = false;

  async getMainCertificateSummary() {
    return summary;
  }
  async saveMainCertificate(input: { certificateBase64: string; password: string }) {
    this.saved = input;
    return summary;
  }
  async removeMainCertificate() {
    this.removed = true;
  }
}

async function callRoute(options: { method: string; body?: Record<string, unknown>; unit?: string; admin?: boolean }) {
  const service = new FakeService();
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { isAdmin: options.admin ?? true, unit: 'main' };
    req.headers['x-system'] = options.unit ?? 'main';
    next();
  });
  app.use(
    '/api/fiscal/certificado',
    createMainCertificateRouter(service as any, async () => undefined),
  );
  const server = await new Promise<http.Server>((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const address = server.address() as { port: number };
  const response = await fetch(`http://127.0.0.1:${address.port}/api/fiscal/certificado`, {
    method: options.method,
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return { response, body: text ? JSON.parse(text) : null, service };
}

test('returns only the main certificate summary to an administrator', async () => {
  const { response, body } = await callRoute({ method: 'GET' });

  assert.equal(response.status, 200);
  assert.deepEqual(body, summary);
  assert.equal('pfxEncrypted' in body, false);
  assert.equal('passwordEncrypted' in body, false);
});

test('rejects non-admin and non-main scopes', async () => {
  assert.equal((await callRoute({ method: 'GET', admin: false })).response.status, 403);
  assert.equal((await callRoute({ method: 'GET', unit: 'franchise' })).response.status, 403);
  assert.equal((await callRoute({ method: 'GET', unit: 'factory' })).response.status, 403);
});

test('validates uploads and supports removal', async () => {
  const invalid = await callRoute({ method: 'PUT', body: { certificado: '', senha: '' } });
  assert.equal(invalid.response.status, 400);

  const valid = await callRoute({ method: 'PUT', body: { certificado: 'pfx', senha: 'secret' } });
  assert.equal(valid.response.status, 200);
  assert.deepEqual(valid.service.saved, { certificateBase64: 'pfx', password: 'secret' });

  const removed = await callRoute({ method: 'DELETE' });
  assert.equal(removed.response.status, 204);
  assert.equal(removed.service.removed, true);
});
