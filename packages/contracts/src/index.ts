import { Type } from 'typebox'

export const WorkspaceId = Type.String({ pattern: '^wrk_[a-z0-9]+$' })
export type WorkspaceId = `wrk_${string}`

export const serviceDescriptor = {
  name: 'GraphiteMD',
  apiVersion: 'v1',
} as const
