// Placeholder Vite configuration to satisfy tooling after archiving the React app.
// This file is intentionally minimal and not used by the PHP application.
import { defineConfig } from 'vite'
import { componentTagger } from 'lovable-tagger'
import path from 'node:path'

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Keep build minimal to avoid legacy React checks
  optimizeDeps: {
    entries: [],
  },
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
}))
