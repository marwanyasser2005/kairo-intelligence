import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': configDirectory,
    },
  },
  ssr: {
    target: 'webworker',
    noExternal: true,
  },
  build: {
    target: 'es2022',
    outDir: path.join(configDirectory, 'dist', 'server'),
    emptyOutDir: false,
    ssr: path.join(configDirectory, 'sites-worker.ts'),
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
      },
    },
  },
});
