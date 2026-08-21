import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { resolve } from 'node:path';
import * as finances from '../finances';

const financesRouteSource = readFileSync(resolve(process.cwd(), 'server/routes/finances.ts'), 'utf8');
const financeCategoriesRouteSource = readFileSync(resolve(process.cwd(), 'server/routes/finance-categories.ts'), 'utf8');

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

test('allows manual reversal of an automatic finance entry', () => {
  const getFinanceReverseError = (finances as any).getFinanceReverseError as ((entry: unknown) => string | undefined) | undefined;

  assert.equal(typeof getFinanceReverseError, 'function');
  assert.equal(getFinanceReverseError?.({ automatic: true }), undefined);
});

test('keeps finance entries directly editable regardless of origin or settlement state', () => {
  assert.equal(financesRouteSource.includes('if ((oldDoc as any).automatic)'), false);
  assert.equal(financesRouteSource.includes('if (settledCents > 0 && amountChanged)'), false);
  assert.equal(financesRouteSource.includes("if (entry.settlementStatus === 'partial'"), false);
});

test('allows deleting a finance category that has existing entries', () => {
  assert.equal(financeCategoriesRouteSource.includes("error: 'category_in_use'"), false);
});
