import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { soulPwa } from '../../packages/pwa/src/soul-pwa-plugin';

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
        pathname.startsWith('/franchise-assets/') ||
        pathname.startsWith('/@') ||
        pathname.startsWith('/src/') ||
        pathname.startsWith('/node_modules/');

      if (isDirectRoute && !isDevAsset) req.url = '/franchise-assets/';
      next();
    });
  },
};

export default defineConfig({
  root: __dirname,
  base: '/franchise-assets/',
  plugins: [
    react(),
    franchiseDevSpaFallback,
    soulPwa({
      assetsDir: resolve(__dirname, '../../packages/pwa/assets'),
      id: '/itu/',
      name: 'Soul540 Franquia',
      shortName: 'Franquia',
      description: 'Gestão da franquia Soul540.',
      scope: '/itu/',
      startUrl: '/itu/',
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
