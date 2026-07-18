import { describe, expect, it } from 'vitest'
import { Check } from 'typebox/value'
import { WorkspaceId, serviceDescriptor } from './index.js'

describe('public contracts', () => {
  it('publishes a versioned service identity and opaque workspace IDs', () => {
    expect(serviceDescriptor).toEqual({ name: 'GraphiteMD', apiVersion: 'v1' })
    expect(Check(WorkspaceId, 'wrk_primary')).toBe(true)
    expect(Check(WorkspaceId, '/Users/taylor/notes')).toBe(false)
  })
})
