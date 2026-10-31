import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('integrates fiscal configuration into invoices without a standalone page', () => {
  const page = source('../NotasFiscais/NotasFiscais.tsx');
  const app = source('../../App.tsx');
  const routes = source('../../routes.ts');
  const sidebar = source('../../components/Sidebar/sidebar-group-sistema.tsx');

  assert.doesNotMatch(routes, /CONFIGURACAO_FISCAL/);
  assert.doesNotMatch(app, /ConfiguracaoFiscal|CONFIGURACAO_FISCAL/);
  assert.doesNotMatch(sidebar, /CONFIGURACAO_FISCAL/);
  assert.match(page, /FiscalConfigurationSection/);
});
