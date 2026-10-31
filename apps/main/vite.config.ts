import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  base: '/',
  plugins: [react()],
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
