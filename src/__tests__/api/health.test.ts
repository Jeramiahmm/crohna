import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/health/route";
import { mockPrisma } from "../setup";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health", () => {
  it("returns healthy when database is connected", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.database).toBe("connected");
    expect(data.timestamp).toBeDefined();
  });

  it("returns unhealthy when database fails", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("Connection refused"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.database).toBe("disconnected");
  });
});
