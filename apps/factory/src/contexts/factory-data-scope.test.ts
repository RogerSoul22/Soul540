import assert from 'node:assert/strict';
import test from 'node:test';
import { getFactoryEventsScope } from './factory-data-scope';

test('admin da fábrica consulta eventos consolidados do principal e das franquias', () => {
  assert.equal(getFactoryEventsScope(true), 'combined');
});

test('usuário comum da fábrica permanece restrito aos eventos da fábrica', () => {
  assert.equal(getFactoryEventsScope(false), 'factory');
});
