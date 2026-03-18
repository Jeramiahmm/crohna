import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "@/app/api/user/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  image: "https://example.com/avatar.jpg",
  preferences: { theme: "dark" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/user", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns user profile", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user.email).toBe("test@example.com");
    expect(data.user.preferences).toEqual({ theme: "dark" });
  });

  it("returns 404 for missing user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/user", () => {
  it("updates user name", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: "New Name" });

    const req = new NextRequest(new URL("/api/user", "http://localhost:3000"), {
      method: "PUT",
      body: JSON.stringify({ name: "New Name" }),
    });
    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user.name).toBe("New Name");
  });

  it("rejects name over 200 characters", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new NextRequest(new URL("/api/user", "http://localhost:3000"), {
      method: "PUT",
      body: JSON.stringify({ name: "a".repeat(201) }),
    });
    const res = await PUT(req);

    expect(res.status).toBe(400);
  });

  it("rejects invalid preferences format", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = new NextRequest(new URL("/api/user", "http://localhost:3000"), {
      method: "PUT",
      body: JSON.stringify({ preferences: "not-an-object" }),
    });
    const res = await PUT(req);

    expect(res.status).toBe(400);
  });
});
