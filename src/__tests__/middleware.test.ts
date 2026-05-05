import { describe, it, expect } from "vitest";
import { middleware, config } from "@/middleware";
import { NextRequest } from "next/server";

// Compiles a Next.js path-to-regexp matcher into a RegExp we can test against.
function matchesMiddleware(pathname: string): boolean {
  return config.matcher.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\((\?[!=].*?)\)/g, "($1)")}$`);
    return regex.test(pathname);
  });
}

function makeRequest(
  pathname: string,
  method = "GET",
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost:3000"), {
    method,
    headers,
  });
}

describe("Middleware — Matcher excludes public routes", () => {
  // The matcher excludes /api/auth/* and /api/health from middleware execution
  // entirely, so the Edge function is never invoked for the OAuth flow or the
  // health endpoint. This keeps Google login working even if the middleware
  // bundle has issues in the Edge runtime.
  it("does not match /api/health", () => {
    expect(matchesMiddleware("/api/health")).toBe(false);
  });

  it("does not match /api/auth/callback/google", () => {
    expect(matchesMiddleware("/api/auth/callback/google")).toBe(false);
  });

  it("does not match /api/auth/error", () => {
    expect(matchesMiddleware("/api/auth/error")).toBe(false);
  });

  it("does not match /api/auth/csrf", () => {
    expect(matchesMiddleware("/api/auth/csrf")).toBe(false);
  });

  it("does not match /api/auth/signin/google", () => {
    expect(matchesMiddleware("/api/auth/signin/google")).toBe(false);
  });

  it("matches /api/events", () => {
    expect(matchesMiddleware("/api/events")).toBe(true);
  });

  it("does not exclude /api/auth lookalikes (e.g. /api/authentication, /api/healthy)", () => {
    expect(matchesMiddleware("/api/authentication")).toBe(true);
    expect(matchesMiddleware("/api/healthy")).toBe(true);
  });
});

describe("Middleware — CSRF Enforcement", () => {
  // The middleware no longer enforces auth (each route handler calls
  // getServerSession itself). It only does CSRF defense-in-depth on mutating
  // requests, so the Edge bundle stays small and free of next-auth/jwt.
  it("rejects POST without origin or referer", async () => {
    const req = makeRequest("/api/events", "POST");
    const res = await middleware(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("origin");
  });

  it("rejects POST with cross-origin header", async () => {
    const req = makeRequest("/api/events", "POST", {
      origin: "http://evil.com",
    });
    const res = await middleware(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("cross-origin");
  });

  it("allows POST with same-origin header", async () => {
    const req = makeRequest("/api/events", "POST", {
      origin: "http://localhost:3000",
    });
    const res = await middleware(req);

    expect(res.status).not.toBe(403);
  });

  it("allows GET without origin (CSRF only applies to mutating methods)", async () => {
    const req = makeRequest("/api/events", "GET");
    const res = await middleware(req);

    expect(res.status).not.toBe(403);
  });

  it("rejects DELETE without origin", async () => {
    const req = makeRequest("/api/events/123", "DELETE");
    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it("rejects PUT with cross-origin referer", async () => {
    const req = makeRequest("/api/events/123", "PUT", {
      referer: "http://evil.com/page",
    });
    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it("allows OPTIONS without CSRF check (preflight)", async () => {
    const req = makeRequest("/api/events", "OPTIONS");
    const res = await middleware(req);

    expect(res.status).not.toBe(403);
  });
});
