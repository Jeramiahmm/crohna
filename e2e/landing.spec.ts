import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Crohna/i);
  });

  test("displays hero section", async ({ page }) => {
    await page.goto("/");
    // The hero should have the app name or tagline
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();
  });

  test("shows sign-in button for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("button", { name: /sign in|get started/i });
    await expect(signIn).toBeVisible();
  });

  test("navigation links are present", async ({ page }) => {
    await page.goto("/");
    // Check for main navigation items
    await expect(page.getByRole("link", { name: /timeline/i })).toBeVisible();
  });
});
