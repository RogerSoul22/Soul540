import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { soulPwa } from '../../packages/pwa/src/soul-pwa-plugin';

// Cada container de franquia é o mesmo build com estes dois valores (ver infra/docker/Dockerfile.portal-standalone).
const franchiseSlug = process.env.VITE_FRANCHISE_SLUG || 'campinas';
const assetsBase = process.env.FRANCHISE_ASSETS_BASE || '/franchise-assets/';
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
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: { outDir: resolve(__dirname, 'dist') },
});
