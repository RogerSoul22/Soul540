import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('registers fiscal configuration as an admin-only main-system page', () => {
  const page = source('./ConfiguracaoFiscal.tsx');
  const app = source('../../App.tsx');
  const routes = source('../../routes.ts');
  const sidebar = source('../../components/Sidebar/sidebar-group-sistema.tsx');

  assert.match(routes, /CONFIGURACAO_FISCAL: '\/configuracao-fiscal'/);
  assert.match(app, /routeKey="__admin__"[\s\S]*ROUTES\.CONFIGURACAO_FISCAL/);
  assert.match(sidebar, /path: ROUTES\.CONFIGURACAO_FISCAL,[\s\S]*permKey: '__admin__'/);
  assert.match(page, /ConfirmModal/);
  assert.match(page, /summary\.certificateHolder/);
  assert.match(page, /dias restantes/);
  assert.match(page, /Clique para selecionar o arquivo/);
  assert.match(page, /Enviar certificado/);
  assert.match(page, /certificateConfigured/);
  assert.doesNotMatch(page, /summary\.(pfx|password|senha|pem)/i);
});
