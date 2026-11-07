import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { soulPwa } from '../../packages/pwa/src/soul-pwa-plugin';

// App próprio da franquia Itu: slug e prefixo dos assets fixos (ver Dockerfile.portal-standalone).
const franchiseSlug = 'itu';
const assetsBase = '/itu-assets/';
const franchiseName = franchiseSlug
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const franchiseDevSpaFallback = {
  name: 'franchise-dev-spa-fallback',
  configureServer(server: {
    middlewares: {
      use: (handler: (req: { method?: string; url?: string }, res: unknown, next: () => void) => void) => void;
    };
  }) {
    server.middlewares.use((req, _res, next) => {
      const pathname = req.url?.split('?', 1)[0] || '';
      const isDirectRoute = req.method === 'GET' && pathname !== '/' && !pathname.includes('.');
      const isDevAsset =
        pathname.startsWith('/api/') ||
        pathname.startsWith(assetsBase) ||
        pathname.startsWith('/@') ||
        pathname.startsWith('/src/') ||
        pathname.startsWith('/node_modules/');

      if (isDirectRoute && !isDevAsset) req.url = assetsBase;
      next();
    });
  },
};

export default defineConfig({
  root: __dirname,
  base: assetsBase,
  plugins: [
    react(),
    franchiseDevSpaFallback,
    soulPwa({
      assetsDir: resolve(__dirname, '../../packages/pwa/assets'),
      id: `/${franchiseSlug}/`,
      name: `Soul540 Franquia ${franchiseName}`,
      shortName: franchiseName.slice(0, 12),
      description: `Gestão da franquia ${franchiseName} da Soul540.`,
      scope: `/${franchiseSlug}/`,
      startUrl: `/${franchiseSlug}/`,
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  server: {
    port: 5176,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: { outDir: resolve(__dirname, 'dist') },
});
