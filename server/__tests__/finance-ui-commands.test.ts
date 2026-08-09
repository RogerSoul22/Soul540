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

test('documents the financial business rules in the main interface', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/frontend/pages/Financeiro/Financeiro.tsx'), 'utf8');

  assert.equal(source.includes('Liquidação é o único estado financeiro'), true);
  assert.equal(source.includes('Evento cancelado exclui automaticamente'), true);
  assert.equal(source.includes('não classificados ficam fora do DRE'), true);
  assert.equal(source.includes('Campinas passa a compor Sorocaba'), true);
});

test('documents settlement and cancellation rules in every finance interface', () => {
  for (const file of financePages) {
    const source = readFileSync(resolve(process.cwd(), file), 'utf8');
    assert.equal(source.includes('Liquidação é o único estado financeiro'), true, file);
    assert.equal(source.includes('Evento cancelado exclui automaticamente'), true, file);
  }
});

test('uses the canonical settlement state in the main finance table', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/frontend/pages/Financeiro/Financeiro.tsx'), 'utf8');

  assert.equal(source.includes('getDerivedFinanceLabel'), true);
  assert.equal(source.includes('<option value="settled">Liquidado</option>'), true);
  assert.equal(source.includes('<option value="paid">Pago</option>'), false);
  assert.equal(source.includes('<option value="received">Recebido</option>'), false);
});
