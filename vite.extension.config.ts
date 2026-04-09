import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite config for Chrome Extension build
// Produces multiple entry points: popup, dashboard, background
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'extension/src'),
      '@components': resolve(__dirname, 'extension/src/components'),
      '@hooks': resolve(__dirname, 'extension/src/hooks'),
      '@store': resolve(__dirname, 'extension/src/store'),
      '@services': resolve(__dirname, 'extension/src/services'),
      '@tabnova-types': resolve(__dirname, 'extension/src/types'),
      '@utils': resolve(__dirname, 'extension/src/utils'),
      '@storage': resolve(__dirname, 'extension/src/storage'),
      '@config': resolve(__dirname, 'extension/src/config'),
    },
  },
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/public/popup.html'),
        dashboard: resolve(__dirname, 'extension/public/dashboard.html'),
        background: resolve(__dirname, 'extension/src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Prevent code splitting issues for Service Worker
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
