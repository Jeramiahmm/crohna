import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/stories/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };

function makeRequest(url: string, options?: Omit<RequestInit, "signal"> & { signal?: AbortSignal }) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    ...options,
    headers: { origin: "http://localhost:3000", ...options?.headers },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/stories — duplicate prevention", () => {
  it("returns 409 when story for year already exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    // Story already exists for 2024
    mockPrisma.aIStory.findFirst.mockResolvedValue({
      id: "existing-story",
    });

    const req = makeRequest("/api/stories", {
      method: "POST",
      body: JSON.stringify({ year: 2024 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain("already exists");
  });

  it("allows creating story when no duplicate exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    // No existing story
    mockPrisma.aIStory.findFirst.mockResolvedValue(null);
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.aIStory.create.mockResolvedValue({
      id: "story-new",
      title: "Generated Title",
      period: "January – December 2024",
      year: 2024,
      summary: "AI-generated story summary.",
      highlights: ["Highlight 1", "Highlight 2", "Highlight 3"],
      stats: { events: 0, cities: 0, photos: 0 },
    });

    const req = makeRequest("/api/stories", {
      method: "POST",
      body: JSON.stringify({ year: 2024 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
  });

  it("skips duplicate check when no year is provided (period-only stories)", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findMany.mockResolvedValue([]);
    mockPrisma.aIStory.create.mockResolvedValue({
      id: "story-new",
      title: "Generated Title",
      period: "All Time",
      year: null,
      summary: "AI-generated story summary.",
      highlights: ["Highlight 1"],
      stats: { events: 0, cities: 0, photos: 0 },
    });

    const req = makeRequest("/api/stories", {
      method: "POST",
      body: JSON.stringify({ period: "All Time" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    // Should NOT have checked for duplicates
    expect(mockPrisma.aIStory.findFirst).not.toHaveBeenCalled();
  });
});

describe("GET /api/stories — cursor validation", () => {
  it("returns 400 for invalid cursor format", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/stories?cursor=../../etc/passwd");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid cursor");
  });

  it("returns 400 for cursor with special characters", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/stories?cursor=abc;DROP TABLE stories;");
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("accepts valid alphanumeric cursor", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.aIStory.findMany.mockResolvedValue([]);

    const req = makeRequest("/api/stories?cursor=clx1abc123def456");
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});
