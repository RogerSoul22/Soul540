import assert from 'node:assert/strict';
import test from 'node:test';
import { getFactoryBasePath } from './factory-path';

test('keeps the factory prefix when accessed through the main portal', () => {
  assert.equal(getFactoryBasePath('/fabrica/eventos', '5173'), '/fabrica');
});

test('uses the root router on standalone factory ports', () => {
  assert.equal(getFactoryBasePath('/', '5175'), '');
  assert.equal(getFactoryBasePath('/eventos', '8081'), '');
});

test('keeps direct prefixed factory routes on standalone ports', () => {
  assert.equal(getFactoryBasePath('/fabrica/eventos', '8081'), '/fabrica');
});
