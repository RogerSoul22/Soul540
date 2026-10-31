import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuditLogFilter } from './auditlog.routes';

test('factory administrator is restricted to factory audit records', () => {
  assert.deepEqual(getAuditLogFilter({ user: { isAdmin: true, unit: 'factory' } }, { resource: 'events' }), {
    resource: 'events',
    userUnit: 'factory',
  });
});

test('global administrator can query audit records across units', () => {
  assert.deepEqual(getAuditLogFilter({ user: { isAdmin: true, unit: 'main' } }, { resource: 'events' }), {
    resource: 'events',
  });
});
