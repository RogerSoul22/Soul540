import fs from 'node:fs';

const root = new URL('..', import.meta.url);

const checks = [
  {
    file: 'apps/main/src/pages/ConfiguracaoFiscal/styles/ConfiguracaoFiscal.module.scss',
    selectors: ["html[data-theme='dark']", '.card', '.uploadZone'],
  },
  {
    file: 'apps/main/src/pages/NotasFiscais/styles/NotasFiscais.module.scss',
    selectors: ["html[data-theme='dark']", '.preview', '.previewTable'],
  },
  {
    file: 'apps/franchise/src/pages/Financeiro/styles/Financeiro.module.scss',
    selectors: ["html[data-theme='dark']", '.page', '.modal'],
  },
  {
    file: 'apps/factory/src/pages/Financeiro/styles/Financeiro.module.scss',
    selectors: ["html[data-theme='dark']", '.page', '.modal'],
  },
  {
    file: 'shared/checklists/styles/ChecklistEnvioPage.module.scss',
    selectors: ["html[data-theme='dark']", '.page', '.panel', '.modal'],
  },
];

const failures = [];

for (const check of checks) {
  const fileUrl = new URL(check.file, root);
  const content = fs.readFileSync(fileUrl, 'utf8');
  const darkThemeStart = content.indexOf("html[data-theme='dark']");
  const darkThemeBlock = darkThemeStart >= 0 ? content.slice(darkThemeStart) : '';

  for (const selector of check.selectors) {
    if (!darkThemeBlock.includes(selector)) failures.push(`${check.file}: missing ${selector}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Theme override check passed for ${checks.length} style modules.`);
