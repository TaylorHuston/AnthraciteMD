type Attempt = {
  failures: number
  inFlight: number
  blockedUntil: number
  expiresAt: number
  lastUsed: number
}

export type LoginAttemptLease = {
  cancelled(): void
  failed(): void
  succeeded(): void
}

export class LoginAttemptLimiter {
  readonly #attempts = new Map<string, Attempt>()

  constructor(
    private readonly maximumFailures = 5,
    private readonly blockMilliseconds = 60_000,
    private readonly now: () => number = Date.now,
    private readonly maximumSources = 10_000,
    private readonly retentionMilliseconds = blockMilliseconds,
  ) {
    if (maximumFailures < 1 || maximumSources < 1) {
      throw new Error('Login attempt limits must be positive')
    }
  }

  get trackedSourceCount(): number {
    this.#prune(this.now())
    return this.#attempts.size
  }

  acquire(source: string): LoginAttemptLease | null {
    const now = this.now()
    this.#prune(now)
    let attempt = this.#attempts.get(source)

    if (attempt?.blockedUntil && attempt.blockedUntil <= now) {
      this.#attempts.delete(source)
      attempt = undefined
    }
    if (attempt && attempt.failures + attempt.inFlight >= this.maximumFailures) return null

    if (!attempt) {
      if (!this.#makeRoom()) return null
      attempt = { failures: 0, inFlight: 0, blockedUntil: 0, expiresAt: now + this.retentionMilliseconds, lastUsed: now }
      this.#attempts.set(source, attempt)
    }

    attempt.inFlight += 1
    attempt.lastUsed = now
    attempt.expiresAt = now + this.retentionMilliseconds
    let settled = false

    const settle = (succeeded: boolean) => {
      if (settled) return
      settled = true
      const current = this.#attempts.get(source)
      if (current !== attempt) return
      const settledAt = this.now()
      current.inFlight = Math.max(0, current.inFlight - 1)
      current.lastUsed = settledAt
      current.expiresAt = settledAt + this.retentionMilliseconds
      if (succeeded) {
        current.failures = 0
        current.blockedUntil = 0
      } else {
        current.failures += 1
        if (current.failures >= this.maximumFailures) {
          current.blockedUntil = settledAt + this.blockMilliseconds
          current.expiresAt = current.blockedUntil
        }
      }
      if (current.failures === 0 && current.inFlight === 0) this.#attempts.delete(source)
    }

    return {
      cancelled: () => {
        if (settled) return
        settled = true
        const current = this.#attempts.get(source)
        if (current !== attempt) return
        current.inFlight = Math.max(0, current.inFlight - 1)
        if (current.failures === 0 && current.inFlight === 0) this.#attempts.delete(source)
      },
      failed: () => settle(false),
      succeeded: () => settle(true),
    }
  }

  #prune(now: number): void {
    for (const [source, attempt] of this.#attempts) {
      if (attempt.inFlight === 0 && attempt.expiresAt <= now) this.#attempts.delete(source)
    }
  }

  #makeRoom(): boolean {
    if (this.#attempts.size < this.maximumSources) return true
    let oldest: [string, Attempt] | undefined
    for (const entry of this.#attempts) {
      if (entry[1].inFlight > 0) continue
      if (!oldest || entry[1].lastUsed < oldest[1].lastUsed) oldest = entry
    }
    if (!oldest) return false
    this.#attempts.delete(oldest[0])
    return true
  }
}
