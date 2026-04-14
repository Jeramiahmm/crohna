import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Don't use the global mock — we test the real module
vi.unmock("@/lib/env");

describe("env validation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset module cache so validateEnv() can run again
    vi.resetModules();
    // Reset env to a clean state
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws in production when required vars are missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    // Set Upstash so we don't hit that check first
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    const { validateEnv } = await import("@/lib/env");

    expect(() => validateEnv()).toThrow("Missing required environment variables");
  });

  it("throws in production when Upstash Redis is missing", async () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgres://test";
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.GOOGLE_CLIENT_ID = "test-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-secret";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const { validateEnv } = await import("@/lib/env");

    expect(() => validateEnv()).toThrow("Upstash Redis is required");
  });

  it("does not throw in development when vars are missing", async () => {
    process.env.NODE_ENV = "development";
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
