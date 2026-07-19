import setup from './global-setup.js'

await setup()
await import('../../apps/server/build/bin/server.js')
