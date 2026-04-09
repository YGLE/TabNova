import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./extension/src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  },
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
    },
  },
});
