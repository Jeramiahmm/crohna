import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "@/app/api/stories/[id]/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };
const mockStory = {
  id: "story-1",
  title: "Your 2024",
  period: "January – December 2024",
  year: 2024,
  summary: "Old summary",
  highlights: ["Old highlight"],
  stats: { events: 0, cities: 0, photos: 0 },
  userId: "user-1",
};

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost:3000"), options);
}

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PUT /api/stories/[id]", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("/api/stories/story-1", { method: "PUT" });
    const res = await PUT(req, makeParams("story-1"));

    expect(res.status).toBe(401);
  });

  it("regenerates a story based on events", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.aIStory.findFirst.mockResolvedValue(mockStory);
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: "evt-1",
        title: "Visited Paris",
        date: new Date("2024-05-01"),
        location: "Paris",
        imageUrl: "https://example.com/paris.jpg",
        category: "travel",
      },
      {
        id: "evt-2",
        title: "Got Promoted",
        date: new Date("2024-08-01"),
        location: "NYC",
        imageUrl: null,
        category: "career",
      },
    ]);
    mockPrisma.aIStory.update.mockResolvedValue({
      ...mockStory,
      summary: "A chapter defined by 2 meaningful moments across Paris, NYC.",
      highlights: ["Visited Paris", "Got Promoted"],
      stats: { events: 2, cities: 2, photos: 1 },
    });

    const req = makeRequest("/api/stories/story-1", { method: "PUT" });
    const res = await PUT(req, makeParams("story-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.story.highlights).toContain("Visited Paris");
  });

  it("returns 404 for non-existent story", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.aIStory.findFirst.mockResolvedValue(null);

    const req = makeRequest("/api/stories/missing", { method: "PUT" });
    const res = await PUT(req, makeParams("missing"));

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/stories/[id]", () => {
  it("deletes a story", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.aIStory.findFirst.mockResolvedValue(mockStory);
    mockPrisma.aIStory.delete.mockResolvedValue(mockStory);

    const req = makeRequest("/api/stories/story-1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("story-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 404 for non-existent story", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.aIStory.findFirst.mockResolvedValue(null);

    const req = makeRequest("/api/stories/missing", { method: "DELETE" });
    const res = await DELETE(req, makeParams("missing"));

    expect(res.status).toBe(404);
  });
});
