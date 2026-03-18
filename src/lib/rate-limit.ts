// In-memory rate limiter with per-namespace, per-user token bucket
const stores = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function createRateLimiter(namespace: string, maxRequests: number, windowMs: number) {
  if (!stores.has(namespace)) stores.set(namespace, new Map());
  const store = stores.get(namespace)!;

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
