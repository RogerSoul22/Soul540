import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getFranchiseBasePath, getFranchiseSlug } from './franchise-path';

describe('franchise portal context', () => {
  it('keeps Itu as the canonical path', () => {
    assert.equal(getFranchiseSlug('/itu/financeiro'), 'itu');
    assert.equal(getFranchiseBasePath('/itu/financeiro'), '/itu');
  });

  it('derives a dynamic path from a franchise slug', () => {
    assert.equal(getFranchiseSlug('/franquias/sorocaba/eventos'), 'sorocaba');
    assert.equal(getFranchiseBasePath('/franquias/sorocaba/eventos'), '/franquias/sorocaba');
  });

  it('defaults to Itu outside a dynamic franchise path', () => {
    assert.equal(getFranchiseSlug('/'), 'itu');
    assert.equal(getFranchiseBasePath('/'), '/itu');
  });

  it('uses the root router when the standalone dev server receives a direct route', () => {
    const getBasePath = getFranchiseBasePath as unknown as (pathname: string, port: string) => string;
    assert.equal(getBasePath('/eventos', '5174'), '');
    assert.equal(getBasePath('/itu/eventos', '5174'), '/itu');
    assert.equal(getBasePath('/eventos', '8082'), '');
  });
});
