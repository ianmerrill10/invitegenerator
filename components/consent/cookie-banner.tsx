"use client";

/**
 * Cookie Consent Banner
 *
 * GDPR/CCPA compliant cookie consent management.
 * Displays on first visit and stores preferences.
 *
 * Categories:
 * - Essential (always on)
 * - Analytics (Google Analytics)
 * - Marketing (Facebook Pixel, Google Ads)
 * - Personalization (product recommendations)
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Settings, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface ConsentPreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  timestamp: string;
  version: string;
}

const CONSENT_COOKIE_NAME = "cookie_consent";
const CONSENT_VERSION = "1.0";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: true,
    marketing: true,
    personalization: true,
    timestamp: "",
    version: CONSENT_VERSION,
  });

  useEffect(() => {
    // Check if consent has been given
    const existingConsent = getCookie(CONSENT_COOKIE_NAME);
    if (!existingConsent) {
      // Show banner after short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = async () => {
    const newPreferences: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    await saveConsent(newPreferences);
    setIsVisible(false);
  };

  const handleRejectNonEssential = async () => {
    const newPreferences: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    await saveConsent(newPreferences);
    setIsVisible(false);
  };

  const handleSavePreferences = async () => {
    const newPreferences: ConsentPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    await saveConsent(newPreferences);
    setIsVisible(false);
  };

  const saveConsent = async (prefs: ConsentPreferences) => {
    // Save to cookie
    setCookie(CONSENT_COOKIE_NAME, JSON.stringify(prefs), 365);

    // Send to server for compliance logging
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cookies",
          preferences: prefs,
        }),
      });
    } catch {
      // Silently fail - consent is still saved in cookie
    }

    // Initialize tracking based on preferences
    initializeTracking(prefs);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
        {/* Main Banner */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-surface-900 mb-2">
                We value your privacy
              </h3>
              <p className="text-surface-600 text-sm">
                We use cookies to enhance your experience, show personalized product
                recommendations, and analyze site traffic. By clicking "Accept All",
                you consent to our use of cookies.{" "}
                <Link href="/cookies" className="text-brand-600 hover:underline">
                  Learn more
                </Link>
              </p>
            </div>
            <button
              onClick={handleRejectNonEssential}
              className="text-surface-400 hover:text-surface-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Button onClick={handleAcceptAll} variant="primary">
              Accept All
            </Button>
            <Button onClick={handleRejectNonEssential} variant="outline">
              Essential Only
            </Button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-sm text-surface-600 hover:text-surface-900"
            >
              <Settings className="h-4 w-4" />
              Customize
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Detailed Preferences */}
        {showDetails && (
          <div className="border-t border-surface-200 bg-surface-50 p-6">
            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-surface-900">Essential Cookies</h4>
                  <p className="text-sm text-surface-600">
                    Required for the website to function. Cannot be disabled.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-5 w-5 rounded border-surface-300 text-brand-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-surface-900">Analytics Cookies</h4>
                  <p className="text-sm text-surface-600">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                    }
                    className="h-5 w-5 rounded border-surface-300 text-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-surface-900">Marketing Cookies</h4>
                  <p className="text-sm text-surface-600">
                    Used to track visitors and display relevant ads on other sites.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, marketing: e.target.checked }))
                    }
                    className="h-5 w-5 rounded border-surface-300 text-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Personalization */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-surface-900">Personalization</h4>
                  <p className="text-sm text-surface-600">
                    Enable personalized product recommendations based on your event type.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.personalization}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, personalization: e.target.checked }))
                    }
                    className="h-5 w-5 rounded border-surface-300 text-brand-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePreferences} variant="primary">
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Cookie utilities
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Initialize tracking scripts based on consent
function initializeTracking(prefs: ConsentPreferences) {
  if (typeof window === "undefined") return;

  // Google Analytics
  if (prefs.analytics && process.env.NEXT_PUBLIC_GA_ID) {
    // GA initialization would go here
    console.log("[Consent] Analytics enabled");
  }

  // Facebook Pixel
  if (prefs.marketing && process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
    // FB Pixel initialization would go here
    console.log("[Consent] Marketing enabled");
  }

  // Personalization
  if (prefs.personalization) {
    console.log("[Consent] Personalization enabled");
  }
}

// Export helper to check consent
export function getConsentPreferences(): ConsentPreferences | null {
  const consent = getCookie(CONSENT_COOKIE_NAME);
  if (!consent) return null;
  try {
    return JSON.parse(consent);
  } catch {
    return null;
  }
}

export function hasConsent(category: keyof Omit<ConsentPreferences, "timestamp" | "version">): boolean {
  const prefs = getConsentPreferences();
  if (!prefs) return false;
  return prefs[category];
}
