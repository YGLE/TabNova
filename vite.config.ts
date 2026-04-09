import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
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
    outDir: 'dist',
    emptyOutDir: true,
  },
});
