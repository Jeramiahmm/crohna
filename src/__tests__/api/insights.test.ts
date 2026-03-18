import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/insights/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/insights", () => {
  it("returns null stats for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET();
    const data = await res.json();

    expect(data.stats).toBeNull();
  });

  it("returns null stats when user has no events", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.count.mockResolvedValue(0);

    const res = await GET();
    const data = await res.json();

    expect(data.stats).toBeNull();
  });

  it("returns computed stats for user with events", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.count
      .mockResolvedValueOnce(10) // totalEvents
      .mockResolvedValueOnce(3); // photosCount

    mockPrisma.event.groupBy
      .mockResolvedValueOnce([
        { category: "travel", _count: { id: 5 } },
        { category: "life", _count: { id: 5 } },
      ]) // categoryGroups
      .mockResolvedValueOnce([
        { location: "New York", _count: { id: 4 } },
        { location: "Paris", _count: { id: 2 } },
      ]); // locationGroups

    mockPrisma.event.findMany.mockResolvedValue([
      { date: new Date("2024-03-15") },
      { date: new Date("2024-03-10") },
      { date: new Date("2024-02-01") },
      { date: new Date("2023-12-01") },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stats.totalEvents).toBe(10);
    expect(data.stats.totalPhotos).toBe(3);
    expect(data.stats.citiesVisited).toBe(2);
    expect(data.stats.categories).toHaveLength(2);
    expect(data.stats.cityVisits).toHaveLength(2);
    expect(data.stats.yearlyEvents).toBeDefined();
  });
});
