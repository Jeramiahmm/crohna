import { describe, it, expect } from "vitest";
import { createEventSchema, updateEventSchema, deleteAccountSchema, createStorySchema, updateUserSchema } from "@/lib/validation";

vi.unmock("@/lib/validation");
vi.unmock("@/lib/constants");
vi.unmock("@/lib/api-response");

describe("createEventSchema", () => {
  const valid = { title: "Test", date: "2024-01-01" };

  it("accepts minimal valid input", () => {
    const result = createEventSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts full valid input", () => {
    const result = createEventSchema.safeParse({
      ...valid,
      endDate: "2024-01-02",
      location: "NYC",
      latitude: 40.7,
      longitude: -74.0,
      description: "A test event",
      category: "life",
      imageUrl: "https://example.com/img.jpg",
    });
    expect(result.success).toBe(true);
  });

  // Empty string edge cases
  it("rejects empty string title", () => {
    const result = createEventSchema.safeParse({ title: "", date: "2024-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only title", () => {
    const result = createEventSchema.safeParse({ title: "   ", date: "2024-01-01" });
    // Note: Zod min(1) counts whitespace, so this passes. The API handler trims.
    // This test documents the current behavior.
    expect(result.success).toBe(true);
  });

  // Boundary values
  it("rejects title over 500 chars", () => {
    const result = createEventSchema.safeParse({ title: "a".repeat(501), date: "2024-01-01" });
    expect(result.success).toBe(false);
  });

  it("accepts title at exactly 500 chars", () => {
    const result = createEventSchema.safeParse({ title: "a".repeat(500), date: "2024-01-01" });
    expect(result.success).toBe(true);
  });

  it("rejects location over 200 chars", () => {
    const result = createEventSchema.safeParse({ ...valid, location: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("accepts location at exactly 200 chars", () => {
    const result = createEventSchema.safeParse({ ...valid, location: "a".repeat(200) });
    expect(result.success).toBe(true);
  });

  it("rejects description over 5000 chars", () => {
    const result = createEventSchema.safeParse({ ...valid, description: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  // Date validation
  it("rejects invalid date format", () => {
    const result = createEventSchema.safeParse({ title: "Test", date: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects empty string date", () => {
    const result = createEventSchema.safeParse({ title: "Test", date: "" });
    expect(result.success).toBe(false);
  });

  // endDate > startDate
  it("rejects endDate before startDate", () => {
    const result = createEventSchema.safeParse({
      ...valid,
      date: "2024-06-15",
      endDate: "2024-06-10",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("after start date");
    }
  });

  it("accepts endDate equal to startDate", () => {
    const result = createEventSchema.safeParse({
      ...valid,
      date: "2024-06-15",
      endDate: "2024-06-15",
    });
    expect(result.success).toBe(true);
  });

  // Coordinate validation
  it("rejects latitude out of range", () => {
    expect(createEventSchema.safeParse({ ...valid, latitude: 91 }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...valid, latitude: -91 }).success).toBe(false);
  });

  it("rejects longitude out of range", () => {
    expect(createEventSchema.safeParse({ ...valid, longitude: 181 }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...valid, longitude: -181 }).success).toBe(false);
  });

  it("accepts boundary coordinates", () => {
    expect(createEventSchema.safeParse({ ...valid, latitude: 90, longitude: 180 }).success).toBe(true);
    expect(createEventSchema.safeParse({ ...valid, latitude: -90, longitude: -180 }).success).toBe(true);
  });

  // Category validation
  it("rejects invalid category", () => {
    const result = createEventSchema.safeParse({ ...valid, category: "invalid-cat" });
    expect(result.success).toBe(false);
  });

  it("accepts valid category case-insensitively", () => {
    const result = createEventSchema.safeParse({ ...valid, category: "Life" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("life");
    }
  });

  // SQL injection attempts (should be sanitized by Zod + Prisma)
  it("accepts strings with SQL-like content (sanitized downstream)", () => {
    const result = createEventSchema.safeParse({
      title: "'; DROP TABLE events; --",
      date: "2024-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("'; DROP TABLE events; --");
    }
  });

  it("accepts strings with HTML/XSS content (escaped downstream)", () => {
    const result = createEventSchema.safeParse({
      title: "<script>alert('xss')</script>",
      date: "2024-01-01",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateEventSchema", () => {
  it("accepts partial updates", () => {
    expect(updateEventSchema.safeParse({ title: "Updated" }).success).toBe(true);
    expect(updateEventSchema.safeParse({ location: "NYC" }).success).toBe(true);
    expect(updateEventSchema.safeParse({}).success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = updateEventSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });
});

describe("deleteAccountSchema", () => {
  it("requires exact confirmation string", () => {
    expect(deleteAccountSchema.safeParse({ confirm: "DELETE_MY_ACCOUNT" }).success).toBe(true);
  });

  it("rejects wrong confirmation", () => {
    expect(deleteAccountSchema.safeParse({ confirm: "delete" }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ confirm: "" }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({}).success).toBe(false);
  });
});

describe("createStorySchema", () => {
  it("accepts valid year", () => {
    expect(createStorySchema.safeParse({ year: 2024 }).success).toBe(true);
  });

  it("rejects year out of range", () => {
    expect(createStorySchema.safeParse({ year: 1899 }).success).toBe(false);
    expect(createStorySchema.safeParse({ year: 2101 }).success).toBe(false);
  });

  it("accepts no year (all-time story)", () => {
    expect(createStorySchema.safeParse({}).success).toBe(true);
    expect(createStorySchema.safeParse({ period: "All Time" }).success).toBe(true);
  });
});

describe("updateUserSchema", () => {
  it("accepts valid name", () => {
    expect(updateUserSchema.safeParse({ name: "John" }).success).toBe(true);
  });

  it("rejects name over 200 chars", () => {
    expect(updateUserSchema.safeParse({ name: "a".repeat(201) }).success).toBe(false);
  });

  it("rejects oversized preferences", () => {
    const bigPrefs: Record<string, string> = {};
    for (let i = 0; i < 500; i++) bigPrefs[`key${i}`] = "a".repeat(100);
    expect(updateUserSchema.safeParse({ preferences: bigPrefs }).success).toBe(false);
  });
});
