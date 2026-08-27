import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const portals = [
  {
    name: 'principal',
    api: 'src/frontend/lib/api.ts',
    app: 'src/frontend/App.tsx',
    layout: 'src/frontend/components/Layout/Layout.tsx',
    chartStyles: 'src/frontend/components/HorizontalBarChart/HorizontalBarChart.module.scss',
    supplyStyles: 'src/frontend/pages/EstoqueInsumos/EstoqueInsumos.module.scss',
  },
  {
    name: 'fábrica',
    api: 'factory/src/lib/api.ts',
    app: 'factory/src/App.tsx',
    layout: 'factory/src/components/Layout/Layout.tsx',
    chartStyles: 'factory/src/components/HorizontalBarChart/HorizontalBarChart.module.scss',
    supplyStyles: 'factory/src/pages/EstoqueInsumos/EstoqueInsumos/EstoqueInsumos.module.scss',
  },
  {
    name: 'Campinas',
    api: 'franchise/src/lib/api.ts',
    app: 'franchise/src/App.tsx',
    layout: 'franchise/src/components/Layout/Layout.tsx',
    chartStyles: 'franchise/src/components/HorizontalBarChart/HorizontalBarChart.module.scss',
    supplyStyles: 'franchise/src/pages/EstoqueInsumos/EstoqueInsumos.module.scss',
  },
];

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

test('rejects failed API responses and notifies every portal', () => {
  for (const portal of portals) {
    const source = read(portal.api);

    assert.equal(source.includes('class ApiRequestError extends Error'), true, portal.name);
    assert.equal(source.includes("soul540:api-error"), true, portal.name);
    assert.equal(source.includes('if (!response.ok)'), true, portal.name);
    assert.equal(source.includes('throw new ApiRequestError'), true, portal.name);
    assert.equal(source.includes("soul540:unauthorized"), true, portal.name);
  }
});

test('protects each portal with a visible API failure message and render fallback', () => {
  for (const portal of portals) {
    const appSource = read(portal.app);
    const layoutSource = read(portal.layout);

    assert.equal(appSource.includes('<ErrorBoundary>'), true, portal.name);
    assert.equal(layoutSource.includes('ApiFeedback'), true, portal.name);
  }
});

test('ends the session after an unauthorized response in every portal', () => {
  for (const file of [
    'src/frontend/contexts/AuthContext.tsx',
    'factory/src/contexts/AuthContext.tsx',
    'franchise/src/contexts/AuthContext.tsx',
  ]) {
    const source = read(file);
    assert.equal(source.includes("window.addEventListener('soul540:unauthorized'"), true, file);
    assert.equal(source.includes('setUser(null)'), true, file);
  }
});

test('uses the guarded API client for local API calls in the main portal', () => {
  const files = [
    'src/frontend/pages/Cardapios/Cardapios.tsx',
    'src/frontend/pages/Contratantes/Contratantes.tsx',
    'src/frontend/pages/Contratos/Contratos.tsx',
    'src/frontend/pages/EstoqueInsumos/EstoqueInsumos.tsx',
    'src/frontend/pages/EstoqueUtensilios/EstoqueUtensilios.tsx',
    'src/frontend/pages/Eventos/Eventos.tsx',
    'src/frontend/pages/Funcionarios/Funcionarios.tsx',
    'src/frontend/pages/Permissoes/Permissoes.tsx',
    'src/frontend/pages/Usuario/Usuario.tsx',
  ];

  for (const file of files) {
    const source = read(file);
    assert.equal(source.includes("fetch('/api"), false, file);
    assert.equal(source.includes('apiFetch('), true, file);
  }
});

test('keeps dense charts and inventory details usable on mobile', () => {
  for (const portal of portals) {
    const chartStyles = read(portal.chartStyles);
    const supplyStyles = read(portal.supplyStyles);

    assert.equal(chartStyles.includes('@include mobile'), true, portal.name);
    assert.equal(chartStyles.includes('grid-template-columns: 1fr;'), true, portal.name);
    assert.equal(supplyStyles.includes('.viewGrid { display: grid; grid-template-columns: 1fr 1fr; gap: $spacing-md; @include mobile { grid-template-columns: 1fr; } }'), true, portal.name);
  }
});

test('stacks financial event details on mobile', () => {
  for (const file of [
    'src/frontend/pages/Financeiro/Financeiro.module.scss',
    'franchise/src/pages/Financeiro/Financeiro.module.scss',
  ]) {
    const source = read(file);
    assert.equal(source.includes('.eventDetailGrid { grid-template-columns: 1fr; }'), true, file);
  }
});
