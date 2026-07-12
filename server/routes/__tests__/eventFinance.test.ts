import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCommissionAmount, calculateEventFinanceAmounts } from '../events';

test('separates deposit, balance and travel without double counting revenue', () => {
  const result = calculateEventFinanceAmounts({
    budget: 9500,
    depositValue: 2000,
    travelCost: 500,
  });

  assert.equal(result.targetRevenue, 9500);
  assert.equal(result.deposit, 2000);
  assert.equal(result.balance, 7500);
  assert.equal(result.travel, 500);
  assert.equal(result.deposit + result.balance, result.targetRevenue);
});

test('uses final value as the receivable target when it exists', () => {
  const result = calculateEventFinanceAmounts({
    budget: 9500,
    finalValue: 10000,
    depositValue: 3000,
  });

  assert.equal(result.targetRevenue, 10000);
  assert.equal(result.balance, 7000);
});

test('never creates a negative balance when deposit exceeds the estimate', () => {
  const result = calculateEventFinanceAmounts({ budget: 1000, depositValue: 1500 });
  assert.equal(result.targetRevenue, 1500);
  assert.equal(result.balance, 0);
});

test('calculates employee commission with currency rounding and safe limits', () => {
  assert.equal(calculateCommissionAmount(9500, 10), 950);
  assert.equal(calculateCommissionAmount(3333.33, 7.5), 250);
  assert.equal(calculateCommissionAmount(1000, -5), 0);
});
