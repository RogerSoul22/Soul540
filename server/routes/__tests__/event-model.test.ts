import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getEventUnitsForRequest } from '../../utils/eventTenant';

test('limits a non-admin event query to the authenticated unit', () => {
  assert.deepEqual(
    getEventUnitsForRequest({ user: { unit: 'franchise', isAdmin: false }, headers: { 'x-system': 'main' } }, 'combined'),
    ['franchise'],
  );
});

test('allows combined event queries only for administrators', () => {
  assert.deepEqual(
    getEventUnitsForRequest({ user: { unit: 'main', isAdmin: true }, headers: {} }, 'combined'),
    ['main', 'franchise', 'factory'],
  );
});

test('does not retain the event route global lookup helper', () => {
  const source = readFileSync(resolve(process.cwd(), 'server/routes/events.ts'), 'utf8');
  assert.equal(source.includes('findEventInAllCollections'), false);
});
