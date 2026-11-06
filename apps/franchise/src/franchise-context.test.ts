import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getFranchiseBasePath, getFranchiseSlug } from './franchise-path';

describe('franchise portal context', () => {
  it('keeps Campinas as the canonical path', () => {
    assert.equal(getFranchiseSlug('/campinas/financeiro'), 'campinas');
    assert.equal(getFranchiseBasePath('/campinas/financeiro'), '/campinas');
  });

  it('derives a dynamic path from a franchise slug', () => {
    assert.equal(getFranchiseSlug('/franquias/sorocaba/eventos'), 'sorocaba');
    assert.equal(getFranchiseBasePath('/franquias/sorocaba/eventos'), '/franquias/sorocaba');
  });

  it('defaults to Campinas outside a dynamic franchise path', () => {
    assert.equal(getFranchiseSlug('/'), 'campinas');
    assert.equal(getFranchiseBasePath('/'), '/campinas');
  });

  it('uses the root router when the standalone dev server receives a direct route', () => {
    const getBasePath = getFranchiseBasePath as unknown as (pathname: string, port: string) => string;
    assert.equal(getBasePath('/eventos', '5174'), '');
    assert.equal(getBasePath('/campinas/eventos', '5174'), '/campinas');
    assert.equal(getBasePath('/eventos', '8082'), '');
  });
});
