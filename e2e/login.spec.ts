import { test, expect } from "@playwright/test";
import { bypassSitePassword, dismissCookieConsent } from "./helpers";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto("/auth/login");
    await dismissCookieConsent(page);
  });

  test("renders login form with email and password fields", async ({
    page,
  }) => {
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    // Remember-me checkbox
    await expect(page.locator("#rememberMe")).toBeAttached();

    // Submit button exists (shows "Loading..." because auth store isLoading starts true)
    await expect(
      page.locator('button[type="submit"]')
    ).toBeVisible({ timeout: 10000 });
  });

  test("forgot password link navigates correctly", async ({ page }) => {
    const forgotLink = page.getByRole("link", {
      name: /forgot password/i,
    });
    await expect(forgotLink).toBeVisible({ timeout: 10000 });
    await forgotLink.click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/, {
      timeout: 10000,
    });
  });

  test("signup link navigates to registration", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: /sign up/i });
    await expect(signupLink).toBeVisible({ timeout: 10000 });
    await signupLink.click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test("form fields accept input", async ({ page }) => {
    await expect(page.locator("#email")).toBeVisible({ timeout: 10000 });

    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("TestPassword123");

    // Verify values were filled
    await expect(page.locator("#email")).toHaveValue("test@example.com");
    await expect(page.locator("#password")).toHaveValue("TestPassword123");
  });

  test("page has correct heading and social login buttons", async ({
    page,
  }) => {
    await expect(page.getByText(/welcome back/i)).toBeVisible({
      timeout: 10000,
    });

    // Social login buttons
    await expect(
      page.getByRole("button", { name: /google/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /apple/i })
    ).toBeVisible();
  });
});
