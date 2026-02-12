import { type Page } from "@playwright/test";

/**
 * Sets the site-access cookie and pre-accepts cookie consent.
 * Must be called BEFORE the first page.goto() in your test.
 * Navigates to a blank page to establish the origin and set localStorage.
 */
export async function setupTestContext(page: Page) {
  // Set site-access cookie
  await page.context().addCookies([
    {
      name: "site_access_granted",
      value: "InviteGen2025Preview!",
      domain: "localhost",
      path: "/",
    },
  ]);

  // Navigate to favicon to establish the localhost origin (lightweight, no JS)
  await page.goto("/favicon.ico");

  // Now we have an origin — set localStorage to pre-accept cookies
  await page.evaluate(() => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem(
      "cookie-preferences",
      JSON.stringify({ necessary: true, analytics: true, marketing: true })
    );
  });
}

// Keep old name as alias for backwards compat with existing tests
export const bypassSitePassword = setupTestContext;
export const dismissCookieConsent = async (_page: Page) => {
  // No-op — cookie consent is now handled in setupTestContext
};
