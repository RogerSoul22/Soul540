import assert from 'node:assert/strict';
import test from 'node:test';
import { FactoryFinance, Finance, FranchiseFinance, getFinanceModelsForRequest } from './finance-tenant';

test('combined finance scope includes all portal models for global administrators', () => {
  const models = getFinanceModelsForRequest({ user: { isAdmin: true, unit: 'main' } }, 'combined');

  assert.deepEqual(models, [Finance, FranchiseFinance, FactoryFinance]);
});

test('combined finance scope stays within the authenticated tenant for other users', () => {
  const models = getFinanceModelsForRequest({ user: { isAdmin: false, unit: 'main' } }, 'combined');

  assert.deepEqual(models, [Finance]);
});
