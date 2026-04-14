import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/google/photos/proxy/route";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };

function makeRequest(id?: string) {
  const url = id
    ? `/api/google/photos/proxy?id=${id}`
    : "/api/google/photos/proxy";
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    headers: { origin: "http://localhost:3000" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Set NEXTAUTH_SECRET for middleware null check
  process.env.NEXTAUTH_SECRET = "test-secret";
});

describe("GET /api/google/photos/proxy", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("some-photo-id");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 for missing id parameter", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeRequest();
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid id format (path traversal attempt)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeRequest("../../etc/passwd");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid id");
  });

  it("returns 400 for id with special characters", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeRequest("photo<script>alert(1)</script>");
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("returns 404 when user does not own the photo (IDOR prevention)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    // Photo not found for this user
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const req = makeRequest("someone-elses-photo-id");
    const res = await GET(req);

    expect(res.status).toBe(404);
    expect(mockPrisma.event.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        imageUrl: "gphotos://someone-elses-photo-id",
        deletedAt: null,
      },
      select: { id: true },
    });
  });

  it("returns 401 when user has no Google access token", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue({ id: "evt-1" });
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1" });

    const req = makeRequest("valid-photo-id");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Google access token");
  });

  it("verifies ownership check queries correct imageUrl pattern", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const req = makeRequest("ABC123xyz");
    await GET(req);

    expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          imageUrl: "gphotos://ABC123xyz",
        }),
      })
    );
  });
});
