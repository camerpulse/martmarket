// Placeholder Vite configuration to satisfy tooling after archiving the React app.
// This file is intentionally minimal and not used by the PHP application.
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8080,
  },
  // No plugins or build steps; kept for TypeScript include compatibility only.
})
