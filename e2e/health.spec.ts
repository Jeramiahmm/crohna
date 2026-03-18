import { test, expect } from "@playwright/test";

test.describe("Health Check API", () => {
  test("GET /api/health returns status", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.database).toBe("connected");
    expect(data.timestamp).toBeDefined();
  });
});
