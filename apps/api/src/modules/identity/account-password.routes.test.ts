import assert from 'node:assert/strict';
import http from 'node:http';
import bcrypt from 'bcryptjs';
import express from 'express';
import test from 'node:test';
import { createAccountPasswordRouter } from './account-password.routes';

async function call(
  body: Record<string, unknown>,
  currentHash: string | null,
  route = 'password',
  vault: string | null = null,
) {
  const saved: string[] = [];
  const audits: string[] = [];
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { _id: 'user-1' };
    next();
  });
  app.use(
    '/api/account',
    createAccountPasswordRouter({
      findUser: async () => (currentHash ? { passwordHash: currentHash, name: 'Ana' } : null),
      savePasswordHash: async (_id, hash) => {
        saved.push(hash);
      },
      findVault: async () => vault,
      audit: async (_req, name, description) => {
        audits.push(`${description}: ${name}`);
      },
    }),
  );
  const server = await new Promise<http.Server>((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const port = (server.address() as { port: number }).port;
  const response = await fetch(`http://127.0.0.1:${port}/api/account/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return { status: response.status, data, saved, audits };
}

test('changes the password when the current one is correct', async () => {
  const hash = await bcrypt.hash('antiga123', 4);
  const result = await call({ currentPassword: 'antiga123', newPassword: 'nova12345' }, hash);

  assert.equal(result.status, 200);
  assert.equal(result.saved.length, 1);
  assert.equal(await bcrypt.compare('nova12345', result.saved[0]), true);
  assert.deepEqual(result.audits, ['Alterou a própria senha: Ana']);
});

test('refuses a wrong current password without changing anything or ending the session', async () => {
  const hash = await bcrypt.hash('antiga123', 4);
  const result = await call({ currentPassword: 'errada', newPassword: 'nova12345' }, hash);

  assert.equal(result.status, 400);
  assert.match(result.data.error, /senha atual/i);
  assert.equal(result.saved.length, 0);
});

test('requires the current password and a new password with at least 6 characters', async () => {
  const hash = await bcrypt.hash('antiga123', 4);
  assert.equal((await call({ newPassword: 'nova12345' }, hash)).status, 400);
  assert.equal((await call({ currentPassword: 'antiga123', newPassword: '123' }, hash)).status, 400);
  assert.equal((await call({ currentPassword: 'antiga123', newPassword: 'antiga123' }, hash)).status, 400);
});

test('answers 404 when the user no longer exists', async () => {
  assert.equal((await call({ currentPassword: 'a', newPassword: 'nova12345' }, null)).status, 404);
});

test('shows the own password stored in the vault and records the view in the audit log', async () => {
  const { encryptPassword } = await import('../../infrastructure/security/password-vault');
  process.env.JWT_SECRET = 'a'.repeat(40);
  const hash = await bcrypt.hash('antiga123', 4);
  const result = await call({}, hash, 'password/reveal', encryptPassword('antiga123'));

  assert.equal(result.status, 200);
  assert.equal(result.data.password, 'antiga123');
  assert.deepEqual(result.audits, ['Visualizou a própria senha: Ana']);
});

test('reveals nothing when the password is not in the vault yet (old account)', async () => {
  const hash = await bcrypt.hash('antiga123', 4);
  const result = await call({}, hash, 'password/reveal', null);

  assert.equal(result.status, 200);
  assert.equal(result.data.password, null);
  assert.deepEqual(result.audits, []);
});
