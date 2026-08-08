import assert from 'node:assert/strict';
import test from 'node:test';
import * as finances from '../finances';

test('resolves finance writes only within the authorized unit model', () => {
  const getFinanceModelForUnit = (finances as any).getFinanceModelForUnit as ((unit: string) => unknown) | undefined;

  assert.equal(typeof getFinanceModelForUnit, 'function');
  assert.equal(getFinanceModelForUnit?.('main'), finances.Finance);
  assert.equal(getFinanceModelForUnit?.('franchise'), finances.FranchiseFinance);
  assert.equal(getFinanceModelForUnit?.('factory'), finances.FactoryFinance);
});

test('does not allow a non-admin finance summary to request a combined scope', () => {
  const getFinanceModelsForRequest = (finances as any).getFinanceModelsForRequest as ((request: unknown, scope: string) => unknown[]) | undefined;

  assert.equal(typeof getFinanceModelsForRequest, 'function');
  assert.deepEqual(
    getFinanceModelsForRequest?.({ user: { unit: 'franchise', isAdmin: false }, headers: {} }, 'combined'),
    [finances.FranchiseFinance],
  );
});

test('does not allow manual reversal of an automatic finance entry', () => {
  const getFinanceReverseError = (finances as any).getFinanceReverseError as ((entry: unknown) => string | undefined) | undefined;

  assert.equal(typeof getFinanceReverseError, 'function');
  assert.equal(
    getFinanceReverseError?.({ automatic: true }),
    'Altere o evento ou pedido de origem para estornar este lançamento automático',
  );
});
