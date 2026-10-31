import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, normalizeApiError } from './errors';

test('keeps a known public API error', () => {
  const error = normalizeApiError(new ApiError('permission_denied', 'Permissão negada', 403));
  assert.equal(error.status, 403);
  assert.equal(error.code, 'permission_denied');
  assert.equal(error.message, 'Permissão negada');
});

test('hides unknown internal error messages', () => {
  const normalized = normalizeApiError(new Error('MongoServerError: secret database details'));
  assert.equal(normalized.status, 500);
  assert.equal(normalized.code, 'internal_error');
  assert.equal(normalized.message, 'Erro interno do servidor');
});

test('normalizes oversized JSON payloads to 413', () => {
  const error = normalizeApiError({ type: 'entity.too.large', status: 413 });
  assert.equal(error.status, 413);
  assert.equal(error.code, 'payload_too_large');
});
