import { defineConfig } from '@tanstack/react-start'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  vite: {
    plugins: [
      tsconfigPaths(),
    ],
  },
  server: {
    preset: 'vercel',
  },
})
