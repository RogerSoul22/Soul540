import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatFinancePeriodLabel,
  getFinancePeriodForPreset,
  getInitialFinancePeriod,
  getShiftedFinancePeriod,
  matchesFinancePeriod,
} from '../financePeriod';

test('opens the financial filter in the current month through today', () => {
  assert.deepEqual(getInitialFinancePeriod('2026-08-12'), {
    preset: 'this_month',
    start: '2026-08-01',
    end: '2026-08-12',
  });
});

test('builds Conta Azul period shortcuts with inclusive dates', () => {
  const period = getFinancePeriodForPreset('this_month', '2026-08-12');

  assert.deepEqual(period, { preset: 'this_month', start: '2026-08-01', end: '2026-08-12' });
  assert.equal(matchesFinancePeriod('2026-08-01', period), true);
  assert.equal(matchesFinancePeriod('2026-08-12', period), true);
  assert.equal(matchesFinancePeriod('2026-07-31', period), false);
  assert.equal(matchesFinancePeriod('2026-08-13', period), false);
});

test('moves month and custom ranges by their matching duration', () => {
  assert.deepEqual(
    getShiftedFinancePeriod({ preset: 'this_month', start: '2026-08-01', end: '2026-08-31' }, -1),
    { preset: 'this_month', start: '2026-07-01', end: '2026-07-31' },
  );
  assert.deepEqual(
    getShiftedFinancePeriod({ preset: 'custom', start: '2026-08-03', end: '2026-08-12' }, 1),
    { preset: 'custom', start: '2026-08-13', end: '2026-08-22' },
  );
});

test('keeps all-time filtering open and labels the selected interval in Portuguese', () => {
  const allTime = getFinancePeriodForPreset('all_time', '2026-08-12');

  assert.deepEqual(allTime, { preset: 'all_time', start: '', end: '' });
  assert.equal(matchesFinancePeriod('2020-01-01', allTime), true);
  assert.deepEqual(getShiftedFinancePeriod(allTime, 1), allTime);
  assert.equal(formatFinancePeriodLabel({ preset: 'custom', start: '2026-08-01', end: '2026-08-15' }), '01/08/2026 até 15/08/2026');
});
