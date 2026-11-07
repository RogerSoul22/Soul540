import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceRoot = join(packageRoot, '..', '..');

function read(...segments: string[]) {
  return readFileSync(join(workspaceRoot, ...segments), 'utf8');
}

const portals = [
  { app: 'main', id: "id: '/'", scope: "scope: '/'" },
  { app: 'factory', id: "id: '/fabrica/'", scope: "scope: '/fabrica/'" },
  // Cada franquia tem app próprio e monta id e escopo a partir do slug fixo do app.
  { app: 'campinas', id: 'id: `/${franchiseSlug}/`', scope: 'scope: `/${franchiseSlug}/`' },
  { app: 'itu', id: 'id: `/${franchiseSlug}/`', scope: 'scope: `/${franchiseSlug}/`' },
];

test('each portal is an independent PWA with its own id, scope and registration', () => {
  for (const { app, id, scope } of portals) {
    const config = read('apps', app, 'vite.config.ts');
    assert.match(config, /soulPwa\(/, `${app}: plugin`);
    if (app === 'campinas' || app === 'itu') assert.ok(config.includes(`franchiseSlug = '${app}'`), `${app}: slug`);
    assert.ok(config.includes(id), `${app}: id`);
    assert.ok(config.includes(scope), `${app}: scope`);
    // A franquia registra pelo próprio módulo, que também define o manifesto de cada slug.
    const registration =
      app === 'campinas' || app === 'itu'
        ? read('apps', app, 'src', 'franchise-pwa.ts')
        : read('apps', app, 'src', 'main.tsx');
    assert.match(registration, /registerServiceWorker\(/, `${app}: registro`);
  }
  // As franquias usam o mesmo modelo de id, mas cada app tem um slug fixo diferente (verificado acima).
  const ids = portals.map(({ app, id }) => (app === 'campinas' || app === 'itu' ? `${app}:${id}` : id));
  assert.equal(new Set(ids).size, ids.length);
});

test('the service worker never caches the api and leaves other portals to their own workers', () => {
  const worker = read('packages', 'pwa', 'assets', 'service-worker.js');
  assert.match(worker, /startsWith\('\/api\/'\)/);
  assert.match(worker, /request\.method !== 'GET'/);
  assert.match(worker, /\/fabrica\//);
  assert.match(worker, /belongsToAnotherPortal/);
});

test('the service worker is only registered in production builds', () => {
  assert.match(read('packages', 'pwa', 'src', 'register-service-worker.ts'), /import\.meta\.env\.PROD/);
});

test('icons required for installation exist', () => {
  for (const file of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']) {
    const path = join(packageRoot, 'assets', 'icons', file);
    assert.ok(existsSync(path), file);
    assert.ok(statSync(path).size > 500, `${file} vazio`);
  }
});

test('the franchise service worker may control /campinas even though it is served from /franchise-assets', () => {
  for (const file of ['nginx-portal.conf', 'nginx-standalone.conf']) {
    const conf = read('infra', 'docker', file);
    assert.match(conf, /location = \/franchise-assets\/sw\.js/, file);
    assert.match(conf, /Service-Worker-Allowed "\/"/, file);
  }
  // O container da Itu serve os mesmos arquivos sob /itu-assets/.
  assert.match(read('infra', 'docker', 'nginx-standalone.conf'), /location = \/itu-assets\/sw\.js/);
});

test('every franchise path gets its own installable identity from the slug', () => {
  for (const app of ['campinas', 'itu']) {
    const setup = read('apps', app, 'src', 'franchise-pwa.ts');
    assert.match(setup, /applyDynamicManifest\(/);
    assert.match(setup, /id: scope/);
    assert.ok(setup.includes(`slug === '${app}'`), `${app}: manifesto estático`);
    assert.match(read('apps', app, 'src', 'main.tsx'), /setupFranchisePwa\(\)/);
  }

  const dynamic = read('packages', 'pwa', 'src', 'apply-dynamic-manifest.ts');
  assert.match(dynamic, /window\.location/);
  assert.match(dynamic, /createObjectURL/);
  assert.match(read('packages', 'pwa', 'src', 'soul-pwa-plugin.ts'), /buildManifest\(/);
});

test('the service worker is rebuilt per version and precaches every build file', () => {
  const worker = read('packages', 'pwa', 'assets', 'service-worker.js');
  assert.match(worker, /__BUILD_ID__/);
  assert.match(worker, /__PRECACHE__/);
  assert.match(worker, /PRECACHE\.map/);
  const plugin = read('packages', 'pwa', 'src', 'soul-pwa-plugin.ts');
  assert.match(plugin, /PRECACHED/);
  assert.match(plugin, /generateBundle\(_options, bundle\)/);
});

test('every portal shows the offline status banner and the api client keeps the offline layer', () => {
  assert.match(read('packages', 'ui', 'src', 'components', 'portal-layout', 'PortalLayout.tsx'), /<OfflineBanner \/>/);
  const client = read('packages', 'api-client', 'src', 'create-api-fetch.ts');
  assert.match(client, /offline\?\.fallback\(/);
  assert.match(client, /offline\?\.remember\(/);
  assert.match(client, /\/api\/auth\/logout/);
});

test('on phones every portal uses the bottom navigation bar (like dVolt) instead of the side bar', () => {
  for (const app of ['main', 'campinas', 'itu', 'factory']) {
    assert.match(read('apps', app, 'src', 'components', 'Sidebar', 'Sidebar.tsx'), /<MobileNav/, `${app}: MobileNav`);
  }
  const nav = read('packages', 'ui', 'src', 'components', 'mobile-nav', 'MobileNav.tsx');
  assert.match(nav, /Mais opções/);
  assert.match(nav, /onLogout/);
  const styles = read('packages', 'ui', 'src', 'components', 'mobile-nav', 'styles', 'MobileNav.module.scss');
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /--mobile-browser-bottom-inset/);
});

test('the installed main app starts at the portal page, which also opens offline', () => {
  assert.match(read('apps', 'main', 'vite.config.ts'), /startUrl: '\/portal\.html'/);
  const worker = read('packages', 'pwa', 'assets', 'service-worker.js');
  assert.match(worker, /endsWith\('\/portal\.html'\)/);
  assert.match(read('packages', 'pwa', 'src', 'soul-pwa-plugin.ts'), /portal\.html/);
});
