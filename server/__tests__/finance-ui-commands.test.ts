import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const contextFiles = [
  'src/frontend/contexts/AppContext.tsx',
  'franchise/src/contexts/AppContext.tsx',
  'factory/src/contexts/AppContext.tsx',
];

const financePages = [
  'src/frontend/pages/Financeiro/Financeiro.tsx',
  'franchise/src/pages/Financeiro/Financeiro.tsx',
  'factory/src/pages/Financeiro/Financeiro/Financeiro.tsx',
];

test('exposes an explicit settlement command in every active finance client', () => {
  for (const file of contextFiles) {
    const source = readFileSync(resolve(process.cwd(), file), 'utf8');
    assert.equal(source.includes('settleFinance'), true, file);
  }
});

test('does not update financial status directly from active finance pages', () => {
  for (const file of financePages) {
    const source = readFileSync(resolve(process.cwd(), file), 'utf8');
    assert.equal(source.includes('updateFinance(financeId, { status })'), false, file);
  }
});

test('does not send the removed automatic-settlement flag from event clients', () => {
  for (const file of contextFiles) {
    const source = readFileSync(resolve(process.cwd(), file), 'utf8');
    assert.equal(source.includes('markBalanceReceived'), false, file);
  }
});

test('uses the server-side OFX preview and import flow instead of creating entries directly', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/frontend/pages/Financeiro/Financeiro.tsx'), 'utf8');
  const ofxSection = source.slice(source.indexOf('const handleOfxFile'), source.indexOf('// Event combobox state'));

  assert.equal(source.includes('/api/finances/ofx/preview'), true);
  assert.equal(source.includes('/api/finances/ofx/import'), true);
  assert.equal(source.includes('parseOfxForFinance'), false);
  assert.equal(ofxSection.includes('addFinance('), false);
});
