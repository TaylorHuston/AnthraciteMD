import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom' },
  server: {
    host: '127.0.0.1',
    port: Number(process.env.GRAPHITEMD_WEB_PORT ?? '5173'),
    strictPort: true,
    proxy: { '/api': `http://127.0.0.1:${process.env.GRAPHITEMD_API_PORT ?? '3333'}` },
  },
})
