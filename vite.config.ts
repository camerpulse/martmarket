// Placeholder Vite configuration to satisfy tooling after archiving the React app.
// This file is intentionally minimal and not used by the PHP application.
import { defineConfig } from 'vite'
import { componentTagger } from 'lovable-tagger'

export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
  },
  plugins: [
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  // Kept for TypeScript include compatibility only.
}))
