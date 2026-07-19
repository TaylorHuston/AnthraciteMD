import { describe, expect, it } from 'vitest'

import { acceptsPasswordInput, PasswordPolicyError, requirePassword } from './index.js'

describe('owner password policy', () => {
  it('accepts only bounded UTF-8 credentials', () => {
    expect(acceptsPasswordInput('twelve-bytes!')).toBe(true)
    expect(acceptsPasswordInput('short')).toBe(false)
    expect(acceptsPasswordInput('🙂'.repeat(257))).toBe(false)
  })

  it('provides one policy failure for every adapter', () => {
    expect(() => requirePassword('short')).toThrow(PasswordPolicyError)
  })
})
