import { describe, expectTypeOf, it } from 'vitest'
import type { WorkspaceAuthority } from './index.js'

describe('workspace package boundary', () => {
  it('exposes authority through opaque identity rather than host paths', () => {
    expectTypeOf<WorkspaceAuthority['current']>().returns.resolves.toMatchTypeOf<{ workspaceId: `wrk_${string}`; available: boolean }>()
  })
})
