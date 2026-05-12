import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  define: {
    __SPECFORGE_DEV_ROUTES__: JSON.stringify(mode !== 'production'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../backend/_shared', import.meta.url)),
      zod: fileURLToPath(new URL('./node_modules/zod', import.meta.url)),
    },
  },
}));
