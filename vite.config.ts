import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { pwaBuild } from './src/platform/pwa/build';

export default defineConfig({
  plugins: [react(), pwaBuild()],
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes('/node_modules/zod/')) return 'validation';
    if (id.includes('/node_modules/dexie/')) return 'storage';
    if (id.includes('/node_modules/')) return 'react-runtime';
  } } } },
  test: { environment: 'node', include: ['tests/**/*.test.{ts,tsx}'] },
});
