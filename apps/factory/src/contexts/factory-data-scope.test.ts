import assert from 'node:assert/strict';
import test from 'node:test';
import { getFactoryEventsScope } from './factory-data-scope';

test('admin da fábrica consulta somente eventos da fábrica', () => {
  assert.equal(getFactoryEventsScope(true), 'factory');
});

test('usuário comum da fábrica permanece restrito aos eventos da fábrica', () => {
  assert.equal(getFactoryEventsScope(false), 'factory');
});
