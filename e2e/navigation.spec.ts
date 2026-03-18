import { test, expect } from "@playwright/test";

test.describe("Page Navigation", () => {
  test("timeline page loads", async ({ page }) => {
    await page.goto("/timeline");
    await expect(page).toHaveURL(/timeline/);
  });

  test("map page loads", async ({ page }) => {
    await page.goto("/map");
    await expect(page).toHaveURL(/map/);
  });

  test("insights page loads", async ({ page }) => {
    await page.goto("/insights");
    await expect(page).toHaveURL(/insights/);
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/settings/);
  });
});
