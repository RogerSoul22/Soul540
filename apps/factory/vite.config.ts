import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { soulPwa } from '../../packages/pwa/src/soul-pwa-plugin';

export default defineConfig({
  root: __dirname,
  base: '/fabrica',
  plugins: [
    react(),
    soulPwa({
      assetsDir: resolve(__dirname, '../../packages/pwa/assets'),
      id: '/fabrica/',
      name: 'Soul540 Fábrica',
      shortName: 'Fábrica',
      description: 'Controle de produção, pedidos e estoque da fábrica Soul540.',
      scope: '/fabrica/',
      startUrl: '/fabrica/',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: { outDir: resolve(__dirname, 'dist') },
});
