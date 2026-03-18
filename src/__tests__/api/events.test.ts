import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "@/app/api/events/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com", name: "Test" };

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost:3000"), options);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/events", () => {
  it("returns empty array for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("/api/events");
    const res = await GET(req);
    const data = await res.json();

    expect(data.events).toEqual([]);
    expect(data.total).toBe(0);
  });

  it("returns events for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: "evt-1",
        title: "Test Event",
        date: new Date("2024-06-15"),
        endDate: null,
        location: "NYC",
        latitude: 40.7,
        longitude: -74.0,
        imageUrl: null,
        description: "A test event",
        category: "life",
        source: "manual",
      },
    ]);

    const req = makeRequest("/api/events?limit=50");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.events).toHaveLength(1);
    expect(data.events[0].title).toBe("Test Event");
    expect(data.events[0].date).toBe("2024-06-15");
  });

  it("supports cursor-based pagination", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    // Return limit+1 items to indicate hasMore
    const events = Array.from({ length: 3 }, (_, i) => ({
      id: `evt-${i}`,
      title: `Event ${i}`,
      date: new Date("2024-01-01"),
      endDate: null,
      location: null,
      latitude: null,
      longitude: null,
      imageUrl: null,
      description: null,
      category: "life",
      source: "manual",
    }));
    mockPrisma.event.findMany.mockResolvedValue(events);

    const req = makeRequest("/api/events?limit=2");
    const res = await GET(req);
    const data = await res.json();

    expect(data.events).toHaveLength(2);
    expect(data.nextCursor).toBe("evt-1");
  });

  it("validates year parameter", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events?year=abc");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("Invalid year");
  });
});

describe("POST /api/events", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("/api/events", {
      method: "POST",
      body: JSON.stringify({ title: "Test", date: "2024-01-01" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("creates an event with valid data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.create.mockResolvedValue({
      id: "new-evt",
      title: "Birthday Party",
      date: new Date("2024-06-15"),
      endDate: null,
      location: "Home",
      latitude: null,
      longitude: null,
      imageUrl: null,
      description: "Celebration",
      category: "life",
      source: "manual",
    });

    const req = makeRequest("/api/events", {
      method: "POST",
      body: JSON.stringify({
        title: "Birthday Party",
        date: "2024-06-15",
        location: "Home",
        description: "Celebration",
        category: "life",
      }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.event.title).toBe("Birthday Party");
  });

  it("rejects missing title", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events", {
      method: "POST",
      body: JSON.stringify({ date: "2024-01-01" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Title is required");
  });

  it("rejects invalid date", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events", {
      method: "POST",
      body: JSON.stringify({ title: "Test", date: "not-a-date" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Valid date is required");
  });

  it("rejects invalid latitude", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events", {
      method: "POST",
      body: JSON.stringify({ title: "Test", date: "2024-01-01", latitude: 999 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Latitude");
  });

  it("rejects invalid image URL", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events", {
      method: "POST",
      body: JSON.stringify({ title: "Test", date: "2024-01-01", imageUrl: "ftp://bad" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid image URL");
  });

  it("rejects title over 500 characters", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest("/api/events", {
      method: "POST",
      body: JSON.stringify({ title: "a".repeat(501), date: "2024-01-01" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("under 500");
  });
});

describe("DELETE /api/events", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await DELETE();

    expect(res.status).toBe(401);
  });

  it("soft-deletes all user events", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.updateMany.mockResolvedValue({ count: 5 });

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.deleted).toBe(5);
  });
});
