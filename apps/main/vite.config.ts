import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { soulPwa } from '../../packages/pwa/src/soul-pwa-plugin';

export default defineConfig({
  root: __dirname,
  base: '/',
  plugins: [
    react(),
    soulPwa({
      assetsDir: resolve(__dirname, '../../packages/pwa/assets'),
      id: '/',
      name: 'Soul540',
      shortName: 'Soul540',
      description: 'Sistema de gestão principal da Soul540.',
      scope: '/',
      startUrl: '/',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3001',
      '/itu': {
        target: 'http://localhost:5174',
        rewrite: () => '/franchise-assets/',
      },
      '/franquias': {
        target: 'http://localhost:5174',
        rewrite: () => '/franchise-assets/',
      },
      '/franchise-assets': 'http://localhost:5174',
      '/fabrica': 'http://localhost:5175',
    },
  },
  build: { outDir: resolve(__dirname, 'dist') },
});
