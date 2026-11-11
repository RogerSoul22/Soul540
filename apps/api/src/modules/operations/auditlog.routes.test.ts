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

test('global administrator on the factory portal only sees factory records, ignoring the unit filter', () => {
  const req = { user: { isAdmin: true, unit: 'main' }, headers: { 'x-system': 'factory' } };
  assert.deepEqual(getAuditLogFilter(req, { resource: 'events', userUnit: 'main' }), {
    resource: 'events',
    userUnit: 'factory',
  });
});

test('franchise administrator is restricted to their audit records and cannot request another system', () => {
  const franchiseId = '507f1f77bcf86cd799439011';
  const req = {
    user: { isAdmin: true, unit: 'main' },
    headers: { 'x-system': 'franchise', 'x-franchise-id': franchiseId },
  };
  assert.deepEqual(getAuditLogFilter(req, { resource: 'events', userUnit: 'main', franchiseId: 'other' }), {
    resource: 'events',
    userUnit: 'franchise',
    franchiseId,
  });
});
