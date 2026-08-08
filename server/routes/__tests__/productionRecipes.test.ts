import assert from 'node:assert/strict';
import test from 'node:test';
import * as productionRecipes from '../production-recipes';

test('derives the production recipe unit from the authenticated tenant', () => {
  const getProductionRecipeUnit = (productionRecipes as any).getProductionRecipeUnit as ((request: unknown) => string) | undefined;

  assert.equal(typeof getProductionRecipeUnit, 'function');
  assert.equal(
    getProductionRecipeUnit?.({ user: { unit: 'factory', isAdmin: false }, headers: { 'x-system': 'main' } }),
    'factory',
  );
});
