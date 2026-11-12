import assert from 'node:assert/strict';
import test from 'node:test';
import { mapRecipeSuppliesToCatalog } from './supply-orders.catalog';

test('maps recipe supplies without requiring inventory balances', () => {
  assert.deepEqual(
    mapRecipeSuppliesToCatalog([
      { id: 'supply-2', name: 'Guardanapo', measure: 'un', cost: 0.1 },
      { id: 'supply-1', name: 'Azeite', measure: 'ml', cost: 2 },
      { id: 'incomplete', name: '   ' },
      { name: 'Sem identificador' },
    ]),
    [
      { id: 'supply-1', name: 'Azeite', measureUnit: 'ml' },
      { id: 'supply-2', name: 'Guardanapo', measureUnit: 'un' },
    ],
  );
});
