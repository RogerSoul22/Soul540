/*
 * Service worker dos portais Soul540. O mesmo arquivo serve os três portais: cada um o registra no
 * próprio escopo (/, /fabrica/, /itu/) e o cache de cada escopo é separado.
 *
 * - /api nunca passa pelo cache: dados e autenticação sempre vêm da rede.
 * - Páginas: rede primeiro; sem conexão, abre a última versão do portal guardada.
 * - Scripts, estilos, fontes e imagens: usa o cache e atualiza em segundo plano.
 */
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const CACHE_PREFIX = 'soul540-';
// O plugin do Vite troca estes dois valores a cada build: um cache por versão e a lista de arquivos do build.
const BUILD_ID = '__BUILD_ID__';
const CACHE = `${CACHE_PREFIX}${BUILD_ID}-${SCOPE_PATH}`;
const PRECACHE = '__PRECACHE__'.startsWith('__') ? [] : JSON.parse('__PRECACHE__');
const OTHER_PORTALS = ['/fabrica/', '/franchise-assets/', '/itu/', '/franquias/'];
const ASSET_TYPES = ['script', 'style', 'font', 'image', 'worker'];

const OFFLINE_PAGE = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sem conexão — Soul540</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box;
        background: #0a0f1e; color: #f1f5f9; font: 500 16px/1.6 system-ui, sans-serif; text-align: center; }
      button { margin-top: 16px; padding: 10px 18px; border: 0; border-radius: 8px; background: #f59e0b; color: #111827;
        font: inherit; font-weight: 600; cursor: pointer; }
    </style>
  </head>
  <body>
    <main>
      <h1>Sem conexão</h1>
      <p>Não foi possível abrir o sistema agora. Verifique a internet e tente novamente.</p>
      <button type="button" onclick="location.reload()">Tentar novamente</button>
    </main>
  </body>
</html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.allSettled([
          cache.add(new Request(SCOPE_PATH, { cache: 'reload' })),
          ...PRECACHE.map((url) => cache.add(url)),
        ]),
      )
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key.endsWith(`-${SCOPE_PATH}`) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// O portal principal (escopo "/") deixa as páginas dos outros portais para o servidor e para o service worker deles.
function belongsToAnotherPortal(pathname) {
  if (SCOPE_PATH !== '/') return false;
  return OTHER_PORTALS.some((prefix) => pathname.startsWith(prefix) || `${pathname}/` === prefix);
}

async function openPage(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await cache.put(SCOPE_PATH, response.clone());
    return response;
  } catch {
    const shell = await cache.match(SCOPE_PATH);
    return (
      shell || new Response(OFFLINE_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    );
  }
}

async function openAsset(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok && response.type === 'basic') cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || refresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    // Arquivos (portal.html, planilhas) e páginas dos outros portais seguem direto para a rede.
    const isFile = url.pathname.split('/').pop().includes('.');
    if (!isFile && !belongsToAnotherPortal(url.pathname)) event.respondWith(openPage(request));
    return;
  }

  if (ASSET_TYPES.includes(request.destination)) event.respondWith(openAsset(request));
});
