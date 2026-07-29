import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      // Keep CSS config local so Vite never walks up to unrelated drive-level files.
      css: {
        postcss: {
          plugins: [],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(configDirectory, '.'),
        }
      }
    };
});
