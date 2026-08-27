import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const portals = [
  {
    sidebar: 'src/frontend/components/Sidebar/Sidebar.tsx',
    sidebarStyles: 'src/frontend/components/Sidebar/Sidebar.module.scss',
    layout: 'src/frontend/components/Layout/Layout.tsx',
    layoutStyles: 'src/frontend/components/Layout/Layout.module.scss',
    finance: 'src/frontend/pages/Financeiro/Financeiro.tsx',
  },
  {
    sidebar: 'factory/src/components/Sidebar/Sidebar.tsx',
    sidebarStyles: 'factory/src/components/Sidebar/Sidebar.module.scss',
    layout: 'factory/src/components/Layout/Layout.tsx',
    layoutStyles: 'factory/src/components/Layout/Layout.module.scss',
    finance: 'factory/src/pages/Financeiro/Financeiro/Financeiro.tsx',
  },
  {
    sidebar: 'franchise/src/components/Sidebar/Sidebar.tsx',
    sidebarStyles: 'franchise/src/components/Sidebar/Sidebar.module.scss',
    layout: 'franchise/src/components/Layout/Layout.tsx',
    layoutStyles: 'franchise/src/components/Layout/Layout.module.scss',
    finance: 'franchise/src/pages/Financeiro/Financeiro.tsx',
  },
];

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

test('allows every desktop sidebar to be collapsed with a persistent preference', () => {
  for (const portal of portals) {
    const sidebar = read(portal.sidebar);
    const sidebarStyles = read(portal.sidebarStyles);
    const layout = read(portal.layout);
    const layoutStyles = read(portal.layoutStyles);

    assert.equal(sidebar.includes('collapsed: boolean'), true, portal.sidebar);
    assert.equal(sidebar.includes('onToggle: () => void'), true, portal.sidebar);
    assert.equal(sidebar.includes("aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}"), true, portal.sidebar);
    assert.equal(sidebar.includes('title={collapsed ? item.label : undefined}'), true, portal.sidebar);
    assert.equal(sidebarStyles.includes('.sidebarCollapsed'), true, portal.sidebarStyles);
    assert.equal(layout.includes("localStorage.getItem('soul540-sidebar-collapsed')"), true, portal.layout);
    assert.equal(layout.includes('<Sidebar collapsed={sidebarCollapsed}'), true, portal.layout);
    assert.equal(layoutStyles.includes('.mainCollapsed'), true, portal.layoutStyles);
  }
});

test('uses accented user-facing labels in financial screens and navigation', () => {
  for (const portal of portals) {
    const finance = read(portal.finance);

    assert.equal(finance.includes('placeholder="Buscar por descrição, categoria..."'), true, portal.finance);
    assert.equal(finance.includes('<th>Descrição</th>'), true, portal.finance);
    assert.equal(finance.includes('Novo Lançamento'), true, portal.finance);
    assert.equal(finance.includes('<label className={styles.formLabel}>Descrição</label>'), true, portal.finance);
    assert.equal(finance.includes('Descreva o lançamento'), true, portal.finance);
    assert.equal(finance.includes('Não informada'), true, portal.finance);
  }

  assert.equal(read(portals[0].sidebar).includes("'Usuário'"), true, portals[0].sidebar);
  assert.equal(read(portals[1].sidebar).includes("label: 'Fábrica'"), true, portals[1].sidebar);
});

test('uses accented labels in shared operational screens', () => {
  const files = [
    'src/frontend/pages/Auditoria/Auditoria.tsx',
    'src/frontend/pages/Contratos/Contratos.tsx',
    'src/frontend/pages/EstoqueUtensilios/EstoqueUtensilios.tsx',
    'src/frontend/pages/Eventos/Eventos.tsx',
    'src/frontend/pages/Usuario/Usuario.tsx',
    'factory/src/pages/Auditoria/Auditoria/Auditoria.tsx',
    'factory/src/pages/Eventos/Eventos/Eventos.tsx',
    'factory/src/pages/Financeiro/Financeiro/Financeiro.tsx',
    'franchise/src/components/CalendarView/CalendarView.tsx',
    'franchise/src/pages/Auditoria/Auditoria.tsx',
    'franchise/src/pages/Contratos/Contratos.tsx',
    'franchise/src/pages/EstoqueUtensilios/EstoqueUtensilios.tsx',
    'franchise/src/pages/Eventos/Eventos.tsx',
    'franchise/src/pages/Financeiro/Financeiro.tsx',
  ];

  for (const file of files) {
    const source = read(file);
    assert.equal(source.includes('Descricao'), false, file);
    assert.equal(source.includes('Novo Lancamento'), false, file);
    assert.equal(source.includes('Editar Lancamento'), false, file);
  }

  assert.equal(read('src/frontend/pages/EstoqueUtensilios/EstoqueUtensilios.tsx').includes("label: 'Manutenção'"), true);
  assert.equal(read('src/frontend/pages/Usuario/Usuario.tsx').includes('Salvar Alterações'), true);
  assert.equal(read('factory/src/pages/Financeiro/Financeiro/Financeiro.tsx').includes("['geral', 'Visão Geral']"), true);
  assert.equal(read('franchise/src/components/CalendarView/CalendarView.tsx').includes('Cartão - até 2x sem juros na reserva'), true);
});
