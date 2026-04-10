import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateCsrf } from "@/lib/csrf";
import { NextRequest } from "next/server";

// Don't use the global mock for csrf — test the real module
vi.unmock("@/lib/csrf");

function makeRequest(
  method: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(new URL("/api/events", "http://localhost:3000"), {
    method,
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CSRF Validation", () => {
  it("rejects POST with no origin or referer", () => {
    const req = makeRequest("POST");
    const result = validateCsrf(req);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("allows POST with valid origin", async () => {
    const req = makeRequest("POST", { origin: "http://localhost:3000" });
    const result = validateCsrf(req);

    expect(result).toBeNull();
  });

  it("allows POST with valid referer (no origin)", async () => {
    const req = makeRequest("POST", {
      referer: "http://localhost:3000/timeline",
    });
    const result = validateCsrf(req);

    expect(result).toBeNull();
  });

  it("rejects POST with cross-origin", async () => {
    const req = makeRequest("POST", { origin: "http://evil.com" });
    const result = validateCsrf(req);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
    const data = await result!.json();
    expect(data.error).toContain("cross-origin");
  });

  it("rejects POST with cross-origin referer", async () => {
    const req = makeRequest("POST", { referer: "http://evil.com/page" });
    const result = validateCsrf(req);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("rejects POST with invalid origin URL", async () => {
    const req = makeRequest("POST", { origin: "not-a-url" });
    const result = validateCsrf(req);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
    const data = await result!.json();
    expect(data.error).toContain("invalid origin");
  });

  it("rejects POST with invalid referer URL", async () => {
    const req = makeRequest("POST", { referer: "not-a-url" });
    const result = validateCsrf(req);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
    const data = await result!.json();
    expect(data.error).toContain("invalid referer");
  });
});
