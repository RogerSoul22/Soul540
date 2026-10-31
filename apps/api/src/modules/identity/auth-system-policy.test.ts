import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessSystem, isGlobalAdmin } from './auth-system-policy';

test('identifies an administrator from the main unit as global', () => {
  assert.equal(isGlobalAdmin({ isAdmin: true, unit: 'main' }), true);
  assert.equal(isGlobalAdmin({ isAdmin: true }), true);
  assert.equal(isGlobalAdmin({ isAdmin: true, unit: 'franchise' }), false);
});

test('global administrator can access the main system and the factory, but not franchises', () => {
  const user = { isAdmin: true, unit: 'main' as const };
  assert.equal(canAccessSystem(user, 'main'), true);
  assert.equal(canAccessSystem(user, 'franchise'), false);
  assert.equal(canAccessSystem(user, 'factory'), true);
});

test('local administrator can access only the linked system', () => {
  const user = { isAdmin: true, unit: 'franchise' as const, franchiseId: 'itu' };
  assert.equal(canAccessSystem(user, 'franchise'), true);
  assert.equal(canAccessSystem(user, 'main'), false);
});

test('regular users remain restricted to their unit', () => {
  const user = { isAdmin: false, unit: 'factory' as const };
  assert.equal(canAccessSystem(user, 'factory'), true);
  assert.equal(canAccessSystem(user, 'franchise'), false);
});
