import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/events/[id]/restore/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com", name: "Test" };

function makeRequest() {
  return new NextRequest(
    new URL("/api/events/evt-1/restore", "http://localhost:3000"),
    {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    }
  );
}

const mockParams = Promise.resolve({ id: "evt-1" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/events/[id]/restore", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest();
    const res = await POST(req, { params: mockParams });

    expect(res.status).toBe(401);
  });

  it("restores a soft-deleted event", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue({
      id: "evt-1",
      userId: "user-1",
      deletedAt: new Date(),
    });
    mockPrisma.event.update.mockResolvedValue({ id: "evt-1", deletedAt: null });

    const req = makeRequest();
    const res = await POST(req, { params: mockParams });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.restored).toBe(true);
    expect(mockPrisma.event.update).toHaveBeenCalledWith({
      where: { id: "evt-1" },
      data: { deletedAt: null },
    });
  });

  it("returns 404 for non-deleted event", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const req = makeRequest();
    const res = await POST(req, { params: mockParams });

    expect(res.status).toBe(404);
  });

  it("returns 404 for non-existent user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const req = makeRequest();
    const res = await POST(req, { params: mockParams });

    expect(res.status).toBe(404);
  });
});
