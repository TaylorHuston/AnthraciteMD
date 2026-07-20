import { join } from 'node:path'
import { tmpdir } from 'node:os'

export const e2eRoot = join(tmpdir(), 'graphitemd-playwright-foundation')
export const e2eWorkspace = join(e2eRoot, 'workspace')
export const e2eState = join(e2eRoot, 'security')
export const initialPassword = 'graphite-owner-initial'
export const replacementPassword = 'graphite-owner-replaced'
