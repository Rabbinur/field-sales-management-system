interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check and increment attempt count for an identifier (e.g. IP or email).
   */
  public check(key: string): {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      // First attempt or expired window
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1000),
      };
    }

    if (record.count >= this.maxAttempts) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: this.maxAttempts - record.count,
      resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  /**
   * Reset rate limit on successful authentication
   */
  public reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean expired entries periodically
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Global singleton for login rate limiting (5 attempts per 15 minutes)
export const loginRateLimiter = new InMemoryRateLimiter(5, 15 * 60 * 1000);
