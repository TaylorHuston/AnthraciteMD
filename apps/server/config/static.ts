import { defineConfig } from '@adonisjs/static'

export default defineConfig({
  enabled: true,
  dotFiles: 'deny',
  etag: true,
  lastModified: true,
  maxAge: '1h',
})
