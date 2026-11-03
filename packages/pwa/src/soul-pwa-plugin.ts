import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildManifest, MANIFEST_ICONS } from './manifest';

// Tipos mínimos do Vite: este pacote não tem dependências próprias.
type ServerResponse = { setHeader(name: string, value: string): void; end(body: Buffer | string): void };
type Middleware = (req: { url?: string }, res: ServerResponse, next: () => void) => void;
type HtmlTag = { tag: string; attrs: Record<string, string>; injectTo: 'head' };
type VitePlugin = {
  name: string;
  configResolved?: (config: { base: string }) => void;
  transformIndexHtml?: () => HtmlTag[];
  configureServer?: (server: { middlewares: { use: (middleware: Middleware) => void } }) => void;
  generateBundle?: (
    this: { emitFile: (file: { type: 'asset'; fileName: string; source: Buffer | string }) => void },
    options: unknown,
    bundle: Record<string, unknown>,
  ) => void;
};

export interface SoulPwaOptions {
  // Pasta packages/pwa/assets (service-worker.js e icons/).
  assetsDir: string;
  // Identidade do app instalado: precisa ser única por portal.
  id: string;
  name: string;
  shortName: string;
  description: string;
  // Caminhos absolutos que o app instalado controla, ex.: '/', '/fabrica/', '/itu/'.
  scope: string;
  startUrl: string;
  themeColor?: string;
  backgroundColor?: string;
}

// Arquivos que o portal precisa para abrir qualquer tela sem rede.
const PRECACHED = /\.(js|css|woff2?|png|svg|jpe?g|webp)$/i;

const withTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

// Gera manifesto, service worker e ícones de um portal e os serve em dev e no build, sempre sob o `base` do app.
export function soulPwa(options: SoulPwaOptions): VitePlugin {
  const themeColor = options.themeColor ?? '#0a0f1e';
  const backgroundColor = options.backgroundColor ?? '#0a0f1e';
  let base = '/';

  const iconPath = (file: string) => `${base}icons/${file}`;
  const files = (
    precache: string[] = [],
    buildId = 'dev',
  ): Record<string, { type: string; source: Buffer | string }> => ({
    'manifest.webmanifest': {
      type: 'application/manifest+json; charset=utf-8',
      source: JSON.stringify(
        buildManifest({
          id: options.id,
          name: options.name,
          shortName: options.shortName,
          description: options.description,
          scope: options.scope,
          startUrl: options.startUrl,
          themeColor,
          backgroundColor,
          iconBase: `${base}icons/`,
        }),
        null,
        2,
      ),
    },
    'sw.js': {
      type: 'text/javascript; charset=utf-8',
      source: readFileSync(join(options.assetsDir, 'service-worker.js'), 'utf8')
        .split('__BUILD_ID__')
        .join(buildId)
        .split('__PRECACHE__')
        .join(JSON.stringify(precache)),
    },
    'icons/apple-touch-icon.png': {
      type: 'image/png',
      source: readFileSync(join(options.assetsDir, 'icons', 'apple-touch-icon.png')),
    },
    ...Object.fromEntries(
      MANIFEST_ICONS.map(({ file }) => [
        `icons/${file}`,
        { type: 'image/png', source: readFileSync(join(options.assetsDir, 'icons', file)) },
      ]),
    ),
  });

  return {
    name: 'soul540-pwa',
    configResolved(config) {
      base = withTrailingSlash(config.base);
    },
    transformIndexHtml(): HtmlTag[] {
      return [
        { tag: 'link', attrs: { rel: 'manifest', href: `${base}manifest.webmanifest` }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'theme-color', content: themeColor }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: iconPath('apple-touch-icon.png') }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: options.shortName }, injectTo: 'head' },
      ];
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?', 1)[0];
        if (!pathname.startsWith(base)) return next();
        const file = files()[pathname.slice(base.length)];
        if (!file) return next();
        res.setHeader('Content-Type', file.type);
        // O service worker fica sob o prefixo dos assets, mas pode controlar o escopo do portal (ex.: /itu/).
        res.setHeader('Service-Worker-Allowed', '/');
        res.end(file.source);
      });
    },
    generateBundle(_options, bundle) {
      // Todo script, estilo e fonte do build entra no cache na instalação: assim as telas que o usuário
      // ainda não abriu também funcionam sem rede.
      const precache = Object.keys(bundle)
        .filter((fileName) => PRECACHED.test(fileName))
        .map((fileName) => `${base}${fileName}`)
        // Página inicial do app instalado (o portal): precisa abrir sem rede.
        .concat(`${base}portal.html`);
      for (const [fileName, { source }] of Object.entries(files(precache, Date.now().toString(36)))) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
}
