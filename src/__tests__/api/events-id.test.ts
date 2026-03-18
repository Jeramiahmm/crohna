import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "@/app/api/events/[id]/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };
const mockEvent = {
  id: "evt-1",
  title: "Original",
  date: new Date("2024-01-01"),
  endDate: null,
  location: null,
  latitude: null,
  longitude: null,
  imageUrl: null,
  description: null,
  category: "life",
  source: "manual",
  userId: "user-1",
  deletedAt: null,
};

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost:3000"), options);
}

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PUT /api/events/[id]", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("/api/events/evt-1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, makeParams("evt-1"));

    expect(res.status).toBe(401);
  });

  it("returns 404 for non-existent event", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const req = makeRequest("/api/events/nonexistent", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await PUT(req, makeParams("nonexistent"));

    expect(res.status).toBe(404);
  });

  it("updates an event successfully", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
    mockPrisma.event.update.mockResolvedValue({
      ...mockEvent,
      title: "Updated Title",
    });

    const req = makeRequest("/api/events/evt-1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated Title" }),
    });
    const res = await PUT(req, makeParams("evt-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.event.title).toBe("Updated Title");
  });

  it("rejects empty title", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue(mockEvent);

    const req = makeRequest("/api/events/evt-1", {
      method: "PUT",
      body: JSON.stringify({ title: "" }),
    });
    const res = await PUT(req, makeParams("evt-1"));

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/events/[id]", () => {
  it("soft-deletes an event", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
    mockPrisma.event.update.mockResolvedValue({ ...mockEvent, deletedAt: new Date() });

    const req = makeRequest("/api/events/evt-1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("evt-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 404 for event not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.findFirst.mockResolvedValue(null);

    const req = makeRequest("/api/events/missing", { method: "DELETE" });
    const res = await DELETE(req, makeParams("missing"));

    expect(res.status).toBe(404);
  });
});
