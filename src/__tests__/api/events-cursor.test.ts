import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/events/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };

function makeRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    headers: { origin: "http://localhost:3000" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/events — cursor validation", () => {
  it("returns 400 for cursor with path traversal", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events?cursor=../../etc/passwd");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid cursor");
  });

  it("returns 400 for cursor with SQL injection attempt", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events?cursor=1;DROP TABLE events;");
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 for cursor with special characters", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events?cursor=abc<script>alert(1)</script>");
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("accepts valid CUID cursor", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findMany.mockResolvedValue([]);

    const req = makeRequest("/api/events?cursor=clx1abc123def456");
    const res = await GET(req);

    expect(res.status).toBe(200);
  });

  it("works without cursor parameter", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findMany.mockResolvedValue([]);

    const req = makeRequest("/api/events");
    const res = await GET(req);

    expect(res.status).toBe(200);
  });

  it("rejects invalid year parameter", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events?year=9999");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid year");
  });
});
