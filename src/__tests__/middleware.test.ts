import { describe, it, expect, vi, beforeEach } from "vitest";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

vi.unmock("@/middleware");

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Middleware — Public Routes", () => {
  it("allows /api/health without auth", async () => {
    const req = makeRequest("/api/health");
    const res = await middleware(req);

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("allows /api/auth/callback without auth", async () => {
    const req = makeRequest("/api/auth/callback/google");
    const res = await middleware(req);

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("allows /api/auth/session without auth", async () => {
    const req = makeRequest("/api/auth/session");
    const res = await middleware(req);

    expect(res.status).not.toBe(401);
  });
});

describe("Middleware — Auth Enforcement", () => {
  it("rejects GET /api/events without auth token", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const req = makeRequest("/api/events", "GET", {
      origin: "http://localhost:3000",
    });
    const res = await middleware(req);

    expect(res.status).toBe(401);
  });

  it("allows GET /api/events with valid auth token", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "GET", {
      origin: "http://localhost:3000",
    });
    const res = await middleware(req);

    expect(res.status).not.toBe(401);
  });

  it("rejects POST /api/events without auth token", async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const req = makeRequest("/api/events", "POST", {
      origin: "http://localhost:3000",
    });
    const res = await middleware(req);

    // Could be 401 (no auth) — CSRF passes since origin is valid
    expect(res.status).toBe(401);
  });
});

describe("Middleware — CSRF Enforcement", () => {
  it("rejects POST without origin or referer", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "POST");
    const res = await middleware(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("origin");
  });

  it("rejects POST with cross-origin header", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "POST", {
      origin: "http://evil.com",
    });
    const res = await middleware(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("cross-origin");
  });

  it("allows GET without origin (CSRF only applies to mutating methods)", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events", "GET");
    const res = await middleware(req);

    // GET should not be blocked by CSRF
    expect(res.status).not.toBe(403);
  });

  it("rejects DELETE without origin", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events/123", "DELETE");
    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it("rejects PUT with cross-origin referer", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" } as never);

    const req = makeRequest("/api/events/123", "PUT", {
      referer: "http://evil.com/page",
    });
    const res = await middleware(req);

    expect(res.status).toBe(403);
  });

  it("allows OPTIONS without CSRF check (preflight)", async () => {
    const req = makeRequest("/api/events", "OPTIONS");
    const res = await middleware(req);

    // OPTIONS should be allowed (CORS preflight)
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });
});
