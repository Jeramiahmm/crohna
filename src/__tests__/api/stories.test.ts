import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/stories/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost:3000"), options);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/stories", () => {
  it("returns empty for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("/api/stories");
    const res = await GET(req);
    const data = await res.json();

    expect(data.stories).toEqual([]);
  });

  it("returns stories with pagination", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.aIStory.findMany.mockResolvedValue([
      {
        id: "story-1",
        title: "Your 2024",
        period: "January – December 2024",
        year: 2024,
        summary: "A great year",
        highlights: ["Traveled", "Learned"],
        stats: { events: 10, cities: 3, photos: 5 },
      },
    ]);

    const req = makeRequest("/api/stories?limit=50");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stories).toHaveLength(1);
    expect(data.stories[0].title).toBe("Your 2024");
  });
});

describe("POST /api/stories", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("/api/stories", {
      method: "POST",
      body: JSON.stringify({ year: 2024 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("creates a story with year", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.aIStory.create.mockResolvedValue({
      id: "story-new",
      title: "Your 2024",
      period: "January – December 2024",
      year: 2024,
      summary: "This story will be generated based on your life events during this period.",
      highlights: ["Key moment", "Growth", "Connections"],
      stats: { events: 0, cities: 0, photos: 0 },
    });

    const req = makeRequest("/api/stories", {
      method: "POST",
      body: JSON.stringify({ year: 2024 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.story.title).toBe("Your 2024");
  });

  it("rejects invalid year", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/stories", {
      method: "POST",
      body: JSON.stringify({ year: 9999 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
