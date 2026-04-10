import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/user/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";
import { NextRequest } from "next/server";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com", name: "Test" };

function makeRequest(body: unknown) {
  return new NextRequest(new URL("/api/user", "http://localhost:3000"), {
    method: "DELETE",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/user — Account Deletion", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest({ confirm: "DELETE_MY_ACCOUNT" });
    const res = await DELETE(req);

    expect(res.status).toBe(401);
  });

  it("rejects without confirmation string", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest({});
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  it("rejects wrong confirmation string", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = makeRequest({ confirm: "delete my account" });
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  it("deletes account with correct confirmation", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    // The DELETE handler passes an array to $transaction (not a function)
    mockPrisma.$transaction.mockResolvedValue([
      { count: 0 }, { count: 5 }, { count: 0 }, { count: 1 }, { id: "user-1" },
    ]);

    const req = makeRequest({ confirm: "DELETE_MY_ACCOUNT" });
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("returns 404 for non-existent user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const req = makeRequest({ confirm: "DELETE_MY_ACCOUNT" });
    const res = await DELETE(req);

    expect(res.status).toBe(404);
  });

  it("rejects invalid JSON body", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const req = new NextRequest(new URL("/api/user", "http://localhost:3000"), {
      method: "DELETE",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: "not valid json{",
    });
    const res = await DELETE(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid JSON");
  });
});
