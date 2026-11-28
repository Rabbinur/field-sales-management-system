interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-Memory Sliding-Window Rate Limiter
 *
 * ARCHITECTURAL LIMITATIONS & CHARACTERISTICS:
 * 1. Scope: Per-process in-memory store. Limits are NOT shared across multiple horizontally
 *    scaled instances or serverless runtime containers.
 * 2. Persistence: Restarting the Node.js process resets active attempt counters.
 * 3. Client IP Trust: Trusts `x-forwarded-for` and `x-real-ip` headers. In production, this
 *    requires a trusted reverse proxy (e.g. Nginx, Cloudflare, AWS ALB) configured to overwrite
 *    or sanitize untrusted client headers.
 * 4. Dual-Keying: To mitigate IP spoofing, rate limits should be keyed by both IP and normalized
 *    email address, preventing attackers from brute-forcing a specific target user account.
 * 5. Horizontal Scaling Requirement: When deploying beyond a single Node.js instance, this in-memory
 *    implementation must be transitioned to a shared distributed store (such as Redis or a MongoDB
 *    rate_limits collection with TTL index).
 */
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
