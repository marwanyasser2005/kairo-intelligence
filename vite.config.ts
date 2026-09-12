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
      build: {
        rollupOptions: {
          output: {
            // Keep the first visit lean on mobile while giving returning users
            // stable, independently cacheable vendor bundles.
            manualChunks: {
              framework: ['react', 'react-dom', 'react-router-dom'],
              motion: ['framer-motion'],
              ui: ['@heroui/react'],
              data: ['@supabase/supabase-js'],
              charts: ['recharts'],
              maps: ['leaflet', 'react-leaflet'],
              pdf: ['jspdf'],
              canvas: ['html2canvas-pro'],
            },
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(configDirectory, '.'),
        }
      }
    };
});
