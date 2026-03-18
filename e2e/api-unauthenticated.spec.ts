import { test, expect } from "@playwright/test";

test.describe("API routes (unauthenticated)", () => {
  test("GET /api/events returns empty for unauthenticated", async ({ request }) => {
    const res = await request.get("/api/events");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.events).toEqual([]);
    expect(data.total).toBe(0);
  });

  test("GET /api/stories returns empty for unauthenticated", async ({ request }) => {
    const res = await request.get("/api/stories");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.stories).toEqual([]);
  });

  test("GET /api/insights returns null stats for unauthenticated", async ({ request }) => {
    const res = await request.get("/api/insights");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.stats).toBeNull();
  });

  test("GET /api/google/status returns false for unauthenticated", async ({ request }) => {
    const res = await request.get("/api/google/status");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.calendar).toBe(false);
    expect(data.photos).toBe(false);
  });

  test("POST /api/events returns 401 for unauthenticated", async ({ request }) => {
    const res = await request.post("/api/events", {
      data: { title: "Test", date: "2024-01-01" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/upload returns 401 for unauthenticated", async ({ request }) => {
    const res = await request.post("/api/upload");
    expect(res.status()).toBe(401);
  });

  test("GET /api/user returns 401 for unauthenticated", async ({ request }) => {
    const res = await request.get("/api/user");
    expect(res.status()).toBe(401);
  });
});
