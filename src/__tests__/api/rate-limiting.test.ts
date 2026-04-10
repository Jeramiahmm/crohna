import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

// Unmock rate-limit to test the real implementation
vi.unmock("@/lib/rate-limit");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Rate Limiter", () => {
  it("allows requests within limit", async () => {
    const limiter = createRateLimiter("test-allow", 3, 1000);

    const r1 = await limiter("user-1");
    const r2 = await limiter("user-1");
    const r3 = await limiter("user-1");

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
  });

  it("blocks requests exceeding limit", async () => {
    const limiter = createRateLimiter("test-block", 2, 1000);

    await limiter("user-1");
    await limiter("user-1");
    const r3 = await limiter("user-1");

    expect(r3.allowed).toBe(false);
  });

  it("tracks users independently", async () => {
    const limiter = createRateLimiter("test-users", 1, 1000);

    const r1 = await limiter("user-1");
    const r2 = await limiter("user-2");

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it("resets after window expires", async () => {
    const limiter = createRateLimiter("test-reset", 1, 50); // 50ms window

    await limiter("user-1");
    const blocked = await limiter("user-1");
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 60));
    const allowed = await limiter("user-1");
    expect(allowed.allowed).toBe(true);
  });
});
