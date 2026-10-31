import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('renders fiscal certificate configuration inside the invoices page', () => {
  const page = source('./NotasFiscais.tsx');
  const sectionPath = new URL('./components/FiscalConfigurationSection.tsx', import.meta.url);

  assert.equal(existsSync(sectionPath), true);
  assert.match(page, /FiscalConfigurationSection/);
  assert.match(page, /<FiscalConfigurationSection\s*\/>/);
  assert.match(page, /useAuth/);
  assert.match(page, /isAdmin/);
});

test('keeps certificate states in the integrated fiscal section', () => {
  const section = source('./components/FiscalConfigurationSection.tsx');

  assert.match(section, /useConfiguracaoFiscal/);
  assert.match(section, /summary\.certificateHolder/);
  assert.match(section, /Clique para selecionar o arquivo/);
  assert.match(section, /Enviar certificado/);
  assert.match(section, /Remover certificado/);
  assert.match(section, /Substituir certificado/);
  assert.doesNotMatch(section, /summary\.(pfx|password|senha|pem)/i);
});
