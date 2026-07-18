import { describe, expect, it } from 'vitest'
import { connectWorkspace } from './index.js'

describe('service-owned workspace connection', () => {
  it('fails closed when the configured root is unavailable', () => {
    expect(connectWorkspace('wrk_primary', false)).toEqual({ workspaceId: 'wrk_primary', status: 'unavailable' })
  })
})
