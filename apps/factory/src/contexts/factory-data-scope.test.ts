import assert from 'node:assert/strict';
import test from 'node:test';
import { getFactoryEventsScope } from './factory-data-scope';

test('admin da fábrica consulta eventos combinados da fábrica e das franquias vinculadas', () => {
  assert.equal(getFactoryEventsScope(true), 'combined');
});

test('usuário comum da fábrica também consulta eventos combinados da fábrica e das franquias vinculadas', () => {
  assert.equal(getFactoryEventsScope(false), 'combined');
});
