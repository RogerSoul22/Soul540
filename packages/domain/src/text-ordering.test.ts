import assert from 'node:assert/strict';
import test from 'node:test';
import { compareTextPtBr, normalizeTextPtBr } from './text-ordering';

test('normalizes accents, case and spaces for searching', () => {
  assert.equal(normalizeTextPtBr('  Fábrica   de  PIZZA '), 'fabrica de pizza');
});

test('missing values do not break the search (event without location, for example)', () => {
  assert.equal(normalizeTextPtBr(undefined), '');
  assert.equal(normalizeTextPtBr(null), '');
  assert.equal(compareTextPtBr(undefined, 'a') < 0, true);
});
