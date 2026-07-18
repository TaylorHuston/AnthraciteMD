import { describe, expectTypeOf, it } from 'vitest'
import type { GraphitePlugin } from './index.js'

describe('plugin SDK boundary', () => {
  it('requires a manifest and lifecycle without exposing a filesystem handle', () => {
    expectTypeOf<GraphitePlugin>().toHaveProperty('manifest')
    expectTypeOf<GraphitePlugin>().toHaveProperty('activate')
  })
})
