import assert from 'node:assert/strict';
import test from 'node:test';
import { UserModel } from '../auth';

test('does not define a plaintext password field on users', () => {
  assert.equal(UserModel.schema.path('passwordPlain'), undefined);
});

