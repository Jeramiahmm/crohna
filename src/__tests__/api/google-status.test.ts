import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/google/status/route";
import { getServerSession } from "next-auth";
import { mockPrisma } from "../setup";

const mockSession = { user: { email: "test@example.com" } };
const mockUser = { id: "user-1", email: "test@example.com" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/google/status", () => {
  it("returns false for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET();
    const data = await res.json();

    expect(data.calendar).toBe(false);
    expect(data.photos).toBe(false);
  });

  it("returns import status for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.count
      .mockResolvedValueOnce(5) // calendar count
      .mockResolvedValueOnce(0); // photos count

    const res = await GET();
    const data = await res.json();

    expect(data.calendar).toBe(true);
    expect(data.photos).toBe(false);
  });

  it("returns both true when both imported", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.event.count
      .mockResolvedValueOnce(10) // calendar
      .mockResolvedValueOnce(25); // photos

    const res = await GET();
    const data = await res.json();

    expect(data.calendar).toBe(true);
    expect(data.photos).toBe(true);
  });
});
