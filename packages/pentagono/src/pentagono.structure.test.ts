import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceRoot = join(packageRoot, '..', '..');
const portals = ['main', 'franchise', 'factory'];

function read(...segments: string[]): string {
  return readFileSync(join(packageRoot, ...segments), 'utf8');
}

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist'].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const componentNames = readdirSync(join(packageRoot, 'src', 'components'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

test('every component has its own tsx, css module (SkeletonValue only toggles data-skeleton) and index entry', () => {
  const index = read('src', 'components', 'index.ts');

  for (const name of componentNames) {
    assert.ok(existsSync(join(packageRoot, 'src', 'components', name, `${name}.tsx`)), `${name}.tsx`);
    if (name !== 'SkeletonValue') {
      assert.ok(existsSync(join(packageRoot, 'src', 'components', name, `${name}.module.css`)), `${name}.module.css`);
    }
    assert.match(index, new RegExp(`from './${name}/`), `index exports ${name}`);
  }
});

test('components with their own props keep them in a separate type.ts', () => {
  for (const name of componentNames.filter((item) => !item.startsWith('Skeleton'))) {
    assert.ok(existsSync(join(packageRoot, 'src', 'components', name, 'type.ts')), `${name}/type.ts`);
  }
});

test('pentagono styles are plain css and read only --pentagono tokens', () => {
  const files = listFiles(join(packageRoot, 'src'));

  // Os componentes são css puro; só os partials de tokens/mixins em styles/ são Sass, para as telas dos portais.
  assert.deepEqual(
    files.filter((file) => extname(file) === '.scss').map((file) => relative(join(packageRoot, 'src', 'styles'), file)),
    ['_mixins.scss', '_variables.scss'],
  );
  for (const file of files.filter((item) => item.endsWith('.module.css'))) {
    const css = readFileSync(file, 'utf8');
    assert.doesNotMatch(css, /var\(--(?!pentagono-)/, relative(packageRoot, file));
  }
});

test('tokens bridge the legacy portal theme variables and the light theme', () => {
  const tokens = read('src', 'styles', 'tokens.css');

  assert.match(tokens, /--pentagono-color-background: var\(--bg-primary/);
  assert.match(tokens, /--pentagono-color-text: var\(--text-primary/);
  assert.match(tokens, /html\[data-theme='light'\]/);
});

test('data-skeleton keeps layout, hides children and respects reduced motion', () => {
  const style = read('src', 'styles', 'data-skeleton.css');

  assert.match(style, /\[data-skeleton\]:not\(\[data-skeleton='false'\]\)/);
  assert.match(style, /visibility: hidden/);
  assert.match(style, /prefers-reduced-motion: reduce/);
});

test('SkeletonContent and SkeletonValue announce loading to screen readers', () => {
  const content = read('src', 'components', 'SkeletonContent', 'SkeletonContent.tsx');
  const value = read('src', 'components', 'SkeletonValue', 'SkeletonValue.tsx');

  assert.match(content, /role="status"/);
  assert.match(content, /aria-busy="true"/);
  assert.match(content, /<VisuallyHidden>\{label\}/);
  for (const variant of ['page', 'cards', 'table', 'list']) {
    assert.match(content, new RegExp(`variant === '${variant}'`));
  }
  assert.match(value, /data-skeleton=\{loading\}/);
  assert.match(value, /aria-hidden=\{loading\}/);
  assert.match(value, /aria-live="polite"/);
});

test('modals are accessible dialogs that close with Escape', () => {
  for (const name of ['Modal', 'ConfirmModal']) {
    const modal = read('src', 'components', name, `${name}.tsx`);

    assert.match(modal, /aria-modal="true"/, name);
    assert.match(modal, /aria-labelledby/, name);
    assert.match(modal, /'Escape'/, name);
  }
});

test('each portal loads the pentagono styles once, before its own global styles', () => {
  for (const portal of portals) {
    const entry = readFileSync(join(workspaceRoot, 'apps', portal, 'src', 'main.tsx'), 'utf8');
    const pentagono = entry.indexOf('packages/pentagono/src/styles/pentagono.css');

    assert.ok(pentagono >= 0, `${portal} imports pentagono.css`);
    assert.ok(pentagono < entry.indexOf("'./styles/global.scss'"), `${portal} order`);
  }
});

test('portals and screens import pentagono only through its public index', () => {
  const roots = ['apps', 'packages'].map((root) => join(workspaceRoot, root));
  const deepImport = /packages\/pentagono\/src\/(?!index'|styles\/pentagono\.css')/;
  const violations = roots
    .flatMap((root) => listFiles(root))
    .filter((file) => /\.(ts|tsx)$/.test(file) && !file.startsWith(join(packageRoot, 'src')))
    .filter((file) => deepImport.test(readFileSync(file, 'utf8')))
    .map((file) => relative(workspaceRoot, file));

  assert.deepEqual(violations, []);
});

test('components migrated to pentagono no longer exist in the ui package', () => {
  const uiComponents = readdirSync(join(workspaceRoot, 'packages', 'ui', 'src', 'components'));

  for (const name of ['button', 'input', 'select', 'modal', 'confirm-modal', 'badge', 'skeleton-content']) {
    assert.ok(!uiComponents.includes(name), `ui/${name} should live in pentagono`);
  }
});

test('data loading flag drives the skeleton on dashboard, finance, events and tasks pages', () => {
  for (const portal of portals) {
    for (const page of ['Dashboard', 'Financeiro', 'Eventos', 'Tarefas']) {
      const file = readFileSync(join(workspaceRoot, 'apps', portal, 'src', 'pages', page, `${page}.tsx`), 'utf8');

      assert.match(file, /SkeletonContent/, `${portal}/${page}`);
      assert.match(file, /[lL]oading/, `${portal}/${page}`);
    }
  }
});

test('screens use Pentagono components instead of raw button, input, label, select, textarea and table tags', () => {
  const raw = /<(button|input|label|select|textarea|table|thead|tbody|tr|th|td)(?=[\s/>])/;
  const violations = ['apps', 'packages']
    .flatMap((root) => listFiles(join(workspaceRoot, root)))
    .filter((file) => file.endsWith('.tsx') && !file.startsWith(join(packageRoot, 'src')))
    .filter((file) => raw.test(readFileSync(file, 'utf8')))
    .map((file) => relative(workspaceRoot, file));

  assert.deepEqual(violations, []);
});
