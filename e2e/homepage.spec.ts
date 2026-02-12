import { test, expect } from "@playwright/test";
import { bypassSitePassword } from "./helpers";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await bypassSitePassword(page);
  });

  test("renders hero section with CTAs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Page should load without error
    await expect(page).toHaveTitle(/InviteGenerator/i);

    // Hero heading should be visible
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();

    // Primary CTA: "Create Free Invitation" links to signup
    const createCTA = page.getByRole("link", {
      name: /create free invitation/i,
    });
    await expect(createCTA).toBeVisible();
    await expect(createCTA).toHaveAttribute("href", /\/auth\/signup/);
  });

  test("header navigation links are present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const nav = page.locator("header");
    await expect(nav).toBeVisible();

    // Key nav links (from NAVIGATION.main constant: Templates, Pricing, Features, How It Works)
    for (const label of ["Templates", "Pricing", "Features"]) {
      await expect(
        nav.getByRole("link", { name: new RegExp(label, "i") })
      ).toBeVisible();
    }

    // Auth buttons
    await expect(
      nav.getByRole("link", { name: /log in/i })
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: /get started/i })
    ).toBeVisible();
  });

  test("footer renders", async ({ page }) => {
    await page.goto("/");

    // Scroll to bottom to trigger any lazy-loaded content
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight)
    );
    await page.waitForTimeout(500);

    // Footer should exist
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("navigating to /pricing loads pricing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click pricing link in header
    await page.locator("header").getByRole("link", { name: /pricing/i }).click();

    await expect(page).toHaveURL(/\/pricing/, { timeout: 10000 });
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
