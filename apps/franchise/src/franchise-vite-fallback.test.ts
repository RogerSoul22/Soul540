import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('keeps direct franchise dev routes on the SPA fallback', () => {
  const config = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');

  assert.match(config, /configureServer/);
  assert.match(config, /franchise-assets/);
  assert.match(config, /req\.url\s*=\s*["']\/franchise-assets\/["']/);
});
