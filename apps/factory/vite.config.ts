import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  base: '/fabrica',
  plugins: [react()],
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
