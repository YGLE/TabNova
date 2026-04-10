import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, rmSync } from 'fs';

// Plugin custom pour copier les icônes PNG et le manifest
function copyIconsPlugin() {
  return {
    name: 'copy-icons',
    closeBundle() {
      const icons = ['icon-16', 'icon-32', 'icon-48', 'icon-128'];
      const destDir = resolve(__dirname, 'dist-extension/icons');
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

      for (const icon of icons) {
        const src = resolve(__dirname, `extension/public/icons/${icon}.png`);
        const dest = resolve(destDir, `${icon}.png`);
        try {
          copyFileSync(src, dest);
          console.log(`[TabNova] Copied ${icon}.png`);
        } catch {
          console.warn(`[TabNova] Could not copy ${icon}.png`);
        }
      }

      // Also copy manifest.json
      try {
        copyFileSync(
          resolve(__dirname, 'extension/manifest.json'),
          resolve(__dirname, 'dist-extension/manifest.json')
        );
        console.log('[TabNova] Copied manifest.json');
      } catch {
        console.warn('[TabNova] Could not copy manifest.json');
      }

      // Move HTML files from nested path to dist-extension root
      const htmlFiles = ['popup.html', 'dashboard.html'];
      for (const html of htmlFiles) {
        const src = resolve(__dirname, `dist-extension/extension/public/${html}`);
        const dest = resolve(__dirname, `dist-extension/${html}`);
        try {
          copyFileSync(src, dest);
          console.log(`[TabNova] Moved ${html} to root`);
        } catch {
          console.warn(`[TabNova] Could not move ${html}`);
        }
      }

      // Clean up the nested extension/public directory
      try {
        rmSync(resolve(__dirname, 'dist-extension/extension'), { recursive: true, force: true });
        console.log('[TabNova] Cleaned up nested extension/ directory');
      } catch {
        console.warn('[TabNova] Could not clean up nested extension/ directory');
      }
    },
  };
}

// Vite config for Chrome Extension build
// Produces multiple entry points: popup, dashboard, background
export default defineConfig({
  plugins: [react(), copyIconsPlugin()],
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
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/public/popup.html'),
        dashboard: resolve(__dirname, 'extension/public/dashboard.html'),
        background: resolve(__dirname, 'extension/src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep icons in icons/
          if (assetInfo.name?.endsWith('.png')) return 'icons/[name][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
