"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Google Analytics Measurement ID - set this in environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Types are declared in types/gtag.d.ts

// Track page views
function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag === "undefined") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);
}

// Page view tracking component
function PageViewTracker() {
  usePageTracking();
  return null;
}

// Event tracking helper functions
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag === "undefined") return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// Common event trackers
export const analytics = {
  // User events
  signUp: (method: string) => trackEvent("sign_up", "engagement", method),
  login: (method: string) => trackEvent("login", "engagement", method),
  logout: () => trackEvent("logout", "engagement"),

  // Invitation events
  createInvitation: (templateId?: string) =>
    trackEvent("create_invitation", "invitations", templateId),
  editInvitation: (invitationId: string) =>
    trackEvent("edit_invitation", "invitations", invitationId),
  publishInvitation: (invitationId: string) =>
    trackEvent("publish_invitation", "invitations", invitationId),
  shareInvitation: (method: string) =>
    trackEvent("share", "invitations", method),
  downloadInvitation: (format: string) =>
    trackEvent("download", "invitations", format),

  // Template events
  viewTemplate: (templateId: string) =>
    trackEvent("view_template", "templates", templateId),
  selectTemplate: (templateId: string) =>
    trackEvent("select_template", "templates", templateId),

  // RSVP events
  submitRSVP: (invitationId: string) =>
    trackEvent("submit_rsvp", "rsvp", invitationId),
  viewRSVPList: (invitationId: string) =>
    trackEvent("view_rsvp_list", "rsvp", invitationId),
  exportRSVP: (format: string) =>
    trackEvent("export_rsvp", "rsvp", format),

  // Payment events
  viewPricing: () => trackEvent("view_pricing", "monetization"),
  startCheckout: (plan: string) =>
    trackEvent("begin_checkout", "monetization", plan),
  completeCheckout: (plan: string, value: number) =>
    trackEvent("purchase", "monetization", plan, value),

  // Navigation events
  clickCTA: (ctaName: string, location: string) =>
    trackEvent("click_cta", "navigation", `${ctaName}_${location}`),
  searchTemplates: (query: string) =>
    trackEvent("search", "navigation", query),

  // Error events
  errorOccurred: (errorType: string, errorMessage: string) =>
    trackEvent("error", "errors", `${errorType}: ${errorMessage}`),

  // Feature usage
  useAIGeneration: () => trackEvent("use_ai", "features"),
  useBackgroundRemoval: () => trackEvent("use_bg_removal", "features"),
  useQRCode: () => trackEvent("use_qr_code", "features"),
};

// Main Google Analytics component
export function GoogleAnalytics() {
  // Don't render anything if no measurement ID
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Default consent state
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'functionality_storage': 'granted',
              'security_storage': 'granted',
            });

            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure',
            });
          `,
        }}
      />

      {/* Page view tracking */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

// Hook to update consent
export function updateAnalyticsConsent(granted: boolean) {
  if (typeof window.gtag === "undefined") return;

  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

// Hook to update ad consent
export function updateAdConsent(granted: boolean) {
  if (typeof window.gtag === "undefined") return;

  window.gtag("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
  });
}
