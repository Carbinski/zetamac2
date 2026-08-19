import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { zetamacApiPlugin } from './server/api.ts'

export default defineConfig({
  plugins: [react(), zetamacApiPlugin()],
  test: {
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
})
