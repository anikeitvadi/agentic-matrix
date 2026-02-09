import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.{ts,tsx}', '**/__tests__/*.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '.velite': path.resolve(__dirname, '.velite'),
    },
  },
})
