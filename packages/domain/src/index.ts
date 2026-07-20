export const PASSWORD_MINIMUM_BYTES = 12
export const PASSWORD_MAXIMUM_BYTES = 1024

export class PasswordPolicyError extends Error {
  constructor() {
    super(`Password must be between ${PASSWORD_MINIMUM_BYTES} and ${PASSWORD_MAXIMUM_BYTES} UTF-8 bytes`)
    this.name = 'PasswordPolicyError'
  }
}

export function acceptsPasswordInput(password: unknown): password is string {
  if (typeof password !== 'string') return false
  const bytes = new TextEncoder().encode(password).byteLength
  return bytes >= PASSWORD_MINIMUM_BYTES && bytes <= PASSWORD_MAXIMUM_BYTES
}

export function requirePassword(password: unknown): asserts password is string {
  if (!acceptsPasswordInput(password)) throw new PasswordPolicyError()
}
