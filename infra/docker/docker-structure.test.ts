import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const read = (name: string) => readFileSync(new URL(`./${name}`, import.meta.url), 'utf8');
const readRootPackage = () =>
  JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
const readPackage = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../apps/${name}/package.json`, import.meta.url), 'utf8')) as {
    dependencies?: Record<string, string>;
  };

describe('Docker deployment structure', () => {
  it('builds the API from the migrated workspace only', () => {
    const dockerfile = read('Dockerfile.api');
    assert.match(dockerfile, /^FROM node:22-alpine/m);
    assert.doesNotMatch(dockerfile, /COPY\s+server\//);
    assert.match(dockerfile, /COPY\s+apps\/api\//);
  });

  it('copies the selected portal build instead of a root dist directory', () => {
    const dockerfile = read('Dockerfile.portal');
    assert.match(dockerfile, /^FROM node:22-alpine AS build/m);
    assert.match(dockerfile, /portal-dist/);
    assert.doesNotMatch(dockerfile, /COPY\s+--from=build\s+\/app\/dist\s/);
    assert.match(dockerfile, /apps\/main\/dist/);
    assert.match(dockerfile, /apps\/franchise\/dist/);
    assert.match(dockerfile, /apps\/factory\/dist/);
  });

  it('routes the main portal to the factory and franchise services', () => {
    const config = read('nginx-main.conf');
    assert.match(config, /proxy_pass\s+http:\/\/factory:80/);
    assert.match(config, /proxy_pass\s+http:\/\/franchise:80/);
    assert.match(config, /location\s+\/api/);
  });

  it('waits for the API health endpoint before starting portals', () => {
    const compose = read('docker-compose.yml');
    assert.match(compose, /healthcheck:/);
    assert.match(compose, /\/api\/health/);
    assert.equal((compose.match(/condition:\s+service_healthy/g) || []).length, 3);
  });

  it('serves prefixed portal assets from the portal container', () => {
    const config = read('nginx-portal.conf');
    assert.match(config, /location\s+(?:\^~\s+)?\/fabrica\//);
    assert.match(config, /location\s+(?:\^~\s+)?\/franchise-assets\//);
    assert.match(config, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html/);
  });

  it('declares every internal package imported by each application', () => {
    const internalPackages = [
      '@soul540/api-client',
      '@soul540/contracts',
      '@soul540/domain',
      '@soul540/screens',
      '@soul540/ui',
    ];
    for (const app of ['main', 'factory', 'franchise']) {
      const dependencies = readPackage(app).dependencies || {};
      for (const packageName of internalPackages)
        assert.equal(dependencies[packageName], 'workspace:*', `${app} -> ${packageName}`);
    }
    assert.equal(readPackage('api').dependencies?.['@soul540/domain'], 'workspace:*');
    const rootDependencies = readRootPackage().dependencies || {};
    assert.equal(rootDependencies['@soul540/contracts'], 'workspace:*');
    assert.equal(rootDependencies['@soul540/domain'], 'workspace:*');
  });
});
