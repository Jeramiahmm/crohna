import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Don't use the global mock — we test the real module
vi.unmock("@/lib/env");

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    // Use a writable copy for test mutations
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws in production when required vars are missing", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).toThrow("Missing required environment variables");
  });

  it("does not throw in production when Upstash Redis is missing (warns instead)", async () => {
    // Throwing here previously crashed /api/auth/* on every request and broke
    // Google login. The rate limiter has an in-memory fallback, so missing
    // Upstash should warn but not block the app from booting.
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.DATABASE_URL = "postgres://test";
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.GOOGLE_CLIENT_ID = "test-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-secret";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).not.toThrow();
  });

  it("does not throw in development when vars are missing", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    delete process.env.DATABASE_URL;
    delete process.env.NEXTAUTH_SECRET;

    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).not.toThrow();
  });

  it("provides env getters that read from process.env", async () => {
    process.env.DATABASE_URL = "postgres://mydb";
    process.env.NEXTAUTH_SECRET = "my-secret";

    const { env } = await import("@/lib/env");
    expect(env.DATABASE_URL).toBe("postgres://mydb");
    expect(env.NEXTAUTH_SECRET).toBe("my-secret");
  });
});
