import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceRoot = join(packageRoot, '..', '..');

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist'].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function pageFiles(): string[] {
  return ['apps', 'packages']
    .flatMap((root) => listFiles(join(workspaceRoot, root)))
    .filter((file) => file.endsWith('.tsx') && !file.startsWith(join(packageRoot, 'src')));
}

function component(name: string, file: string): string {
  return readFileSync(join(packageRoot, 'src', 'components', name, file), 'utf8');
}

function offenders(pattern: RegExp): string[] {
  return pageFiles()
    .filter((file) => pattern.test(readFileSync(file, 'utf8')))
    .map((file) => relative(workspaceRoot, file));
}

test('every form and table component has real variants instead of a bare passthrough', () => {
  assert.deepEqual(offenders(/(?<![\w-])bare(?![\w-])/), []);
  for (const name of ['Button', 'Input', 'Select', 'Table', 'Textarea']) {
    assert.doesNotMatch(component(name, 'type.ts'), /\bbare\b/, name);
  }
});

test('variants stay declared in the public types', () => {
  assert.match(
    component('Button', 'type.ts'),
    /'chip'[\s\S]*'tab'[\s\S]*'nav'[\s\S]*'outline'[\s\S]*'dashed'[\s\S]*'link'/,
  );
  assert.match(component('Input', 'type.ts'), /'default' \| 'search' \| 'inline' \| 'file'/);
  assert.match(component('Select', 'type.ts'), /'default' \| 'compact' \| 'inline'/);
  assert.match(component('Table', 'type.ts'), /'scroll' \| 'compact' \| 'plain'/);
  assert.match(component('Card', 'type.ts'), /'default' \| 'stat' \| 'flat' \| 'outlined'/);
  assert.match(component('Checkbox', 'type.ts'), /'checkbox' \| 'switch' \| 'card'/);
  assert.match(component('EmptyState', 'type.ts'), /'default' \| 'compact' \| 'inline'/);
  assert.match(component('DocumentViewer', 'type.ts'), /'fullscreen' \| 'panel'/);
  assert.match(component('PageHeader', 'type.ts'), /'default' \| 'greeting'/);
});

test('document viewers and popover backdrops come from the pentagono, not hand-made overlays', () => {
  assert.deepEqual(offenders(/<div[^>]*className=\{styles\.(overlay|pickerOverlay)\}/), []);
  assert.match(component('DocumentViewer', 'DocumentViewer.tsx'), /Escape/);
  assert.match(component('DocumentViewer', 'DocumentViewer.tsx'), /role="dialog"/);
});

test('headings in screens use the Heading component', () => {
  assert.deepEqual(offenders(/<h[1-6](?=[\s>])/), []);
});

test('text inputs clear themselves with an X, except types where clearing makes no sense', () => {
  assert.match(component('Input', 'type.ts'), /clearable\?: boolean/);
  const hook = component('Input', 'use-clearable.ts');
  assert.match(hook, /'text', 'search', 'email', 'tel', 'url', 'password'/);
  assert.doesNotMatch(hook.split('CLEARABLE_TYPES = new Set')[1].split(']')[0], /checkbox|radio|file|date|number/);
  assert.match(component('Input', 'ClearButton.tsx'), /aria-label="Limpar campo"/);
  assert.match(component('Input', 'Input.tsx'), /<ClearButton/);
});

test('date and month fields open the pentagono calendar instead of the browser picker', () => {
  assert.match(component('Input', 'Input.tsx'), /type === 'date' \|\| type === 'month'/);
  assert.match(component('Input', 'Input.tsx'), /<DatePicker/);
  assert.match(component('DatePicker', 'DatePicker.tsx'), /aria-haspopup="dialog"/);
  assert.match(component('DatePicker', 'DatePickerPanel.tsx'), /Escape/);
  assert.match(component('DatePicker', 'type.ts'), /type: DatePickerType/);
});
