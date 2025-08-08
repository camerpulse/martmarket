// Placeholder Vite configuration to satisfy tooling after archiving the React app.
// This file is intentionally minimal and not used by the PHP application.
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [],
  // Prevent Vite from scanning TS/JS entries to avoid legacy React typecheck noise
  optimizeDeps: {
    entries: [],
  },
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
})
