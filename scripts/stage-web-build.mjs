import { cp, readFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'apps/web/dist')
const target = path.join(root, 'apps/server/public')

await readFile(path.join(source, 'index.html'))
await rm(target, { recursive: true, force: true })
await cp(source, target, { recursive: true, errorOnExist: true, force: false })
