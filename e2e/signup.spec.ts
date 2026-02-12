import { test, expect } from "@playwright/test";
import { bypassSitePassword, dismissCookieConsent } from "./helpers";

test.describe("Signup Page", () => {
  test.beforeEach(async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto("/auth/signup");
    await dismissCookieConsent(page);
  });

  test("renders signup form with all fields", async ({ page }) => {
    // All required form fields should be present
    await expect(page.locator("#name")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();

    // Terms checkbox
    await expect(page.locator("#acceptTerms")).toBeAttached();

    // Submit button exists (may show "Loading..." due to auth store)
    await expect(
      page.locator('button[type="submit"]')
    ).toBeVisible({ timeout: 10000 });

    // Sign in link for existing users
    await expect(
      page.getByRole("link", { name: /sign in/i })
    ).toBeVisible();
  });

  test("password field has proper validation attributes", async ({
    page,
  }) => {
    // Wait for full page hydration
    await expect(page.locator("#name")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#password")).toBeVisible();

    // Password field should be a registered form field with type="password"
    await expect(page.locator("#password")).toHaveAttribute("type", "password");
    await expect(page.locator("#password")).toHaveAttribute("name", "password");

    // Confirm password field should also exist
    await expect(page.locator("#confirmPassword")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toHaveAttribute("type", "password");

    // Show password toggle buttons should be present
    await expect(
      page.locator("#password").locator("..").getByRole("button", { name: /show password/i })
    ).toBeVisible();
  });

  test("form fields accept input", async ({ page }) => {
    await expect(page.locator("#name")).toBeVisible({ timeout: 10000 });

    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("TestPassword123");
    await page.locator("#confirmPassword").fill("TestPassword123");

    // Verify values
    await expect(page.locator("#name")).toHaveValue("Test User");
    await expect(page.locator("#email")).toHaveValue("test@example.com");
    await expect(page.locator("#password")).toHaveValue("TestPassword123");
    await expect(page.locator("#confirmPassword")).toHaveValue("TestPassword123");
  });

  test("navigates to login page via sign-in link", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /sign in/i })
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("terms and privacy links are present", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /terms/i }).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("link", { name: /privacy/i }).first()
    ).toBeVisible();
  });
});
