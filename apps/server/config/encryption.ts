import { defineConfig, drivers } from '@adonisjs/core/encryption'

const encryptionConfig = defineConfig({
  default: 'gcm',
  list: {
    gcm: drivers.aes256gcm({
      keys: [process.env.APP_KEY ?? 'graphitemd-development-only-key'],
      id: 'gcm',
    }),
  },
})

export default encryptionConfig

declare module '@adonisjs/core/types' {
  export interface EncryptorsList extends InferEncryptors<typeof encryptionConfig> {}
}
