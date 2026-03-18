import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Use Upstash Redis for distributed rate limiting that works across
// serverless instances (e.g. Vercel). Falls back to in-memory if
// Upstash env vars are not configured (local dev).

const hasUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Cache rate limiter instances per namespace
const limiters = new Map<string, ReturnType<typeof createLimiter>>();

function createUpstashLimiter(namespace: string, maxRequests: number, windowMs: number) {
  const redis = Redis.fromEnv();
  const windowSec = Math.max(Math.ceil(windowMs / 1000), 1);

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(maxRequests, `${windowSec} s`),
    prefix: `ratelimit:${namespace}`,
  });

  return async function check(userId: string): Promise<{ allowed: boolean }> {
    const { success } = await ratelimit.limit(userId);
    return { allowed: success };
  };
}

// In-memory fallback for local development without Upstash
const memStores = new Map<string, Map<string, { count: number; resetAt: number }>>();

function createMemoryLimiter(namespace: string, maxRequests: number, windowMs: number) {
  if (!memStores.has(namespace)) memStores.set(namespace, new Map());
  const store = memStores.get(namespace)!;

  return function check(userId: string): { allowed: boolean } {
    const now = Date.now();
    const entry = store.get(userId);
    if (!entry || now > entry.resetAt) {
      store.set(userId, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    }
    if (entry.count >= maxRequests) {
      return { allowed: false };
    }
    entry.count++;
    return { allowed: true };
  };
}

function createLimiter(namespace: string, maxRequests: number, windowMs: number) {
  if (hasUpstash) {
    return createUpstashLimiter(namespace, maxRequests, windowMs);
  }
  // Wrap sync fallback to match async interface
  const syncCheck = createMemoryLimiter(namespace, maxRequests, windowMs);
  return (userId: string) => Promise.resolve(syncCheck(userId));
}

/**
 * Create a rate limiter for a given namespace.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * are set, otherwise falls back to in-memory (single-instance only).
 *
 * Usage:
 *   const checkLimit = createRateLimiter("events", 30, 60_000);
 *   const { allowed } = await checkLimit(userId);
 */
export function createRateLimiter(namespace: string, maxRequests: number, windowMs: number) {
  if (!limiters.has(namespace)) {
    limiters.set(namespace, createLimiter(namespace, maxRequests, windowMs));
  }
  return limiters.get(namespace)!;
}
