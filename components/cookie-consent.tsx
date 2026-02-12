"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Cookie, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  preferences: false,
};

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // Load saved preferences
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
    return undefined;
  }, []);

  const saveConsent = (accepted: boolean, prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? "accepted" : "declined");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);

    // Trigger analytics initialization if accepted
    if (prefs.analytics) {
      // Initialize analytics (e.g., Google Analytics)
      initializeAnalytics();
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(true, allAccepted);
  };

  const handleAcceptNecessary = () => {
    saveConsent(true, DEFAULT_PREFERENCES);
  };

  const handleSavePreferences = () => {
    saveConsent(true, preferences);
    setShowSettings(false);
  };

  const initializeAnalytics = () => {
    // Placeholder for analytics initialization
    // This would typically initialize Google Analytics, etc.
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: preferences.marketing ? "granted" : "denied",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden" role="dialog" aria-label="Cookie consent">
            {/* Main Banner */}
            <AnimatePresence mode="wait">
              {!showSettings ? (
                <motion.div
                  key="banner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-heading font-semibold text-surface-900 mb-2">
                        We value your privacy
                      </h3>
                      <p className="text-surface-600 text-sm mb-4">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies. Read our{" "}
                        <Link href="/privacy" className="text-brand-600 hover:text-brand-700 underline">
                          Privacy Policy
                        </Link>{" "}
                        to learn more.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={handleAcceptAll} size="sm">
                          Accept All
                        </Button>
                        <Button onClick={handleAcceptNecessary} variant="outline" size="sm">
                          Necessary Only
                        </Button>
                        <Button
                          onClick={() => setShowSettings(true)}
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Customize
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={handleAcceptNecessary}
                      className="flex-shrink-0 p-1 text-surface-400 hover:text-surface-600 transition-colors"
                      aria-label="Close cookie banner"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-surface-900">
                      Cookie Preferences
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-1 text-surface-400 hover:text-surface-600 transition-colors"
                      aria-label="Back to banner"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Necessary Cookies */}
                    <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-surface-900">Necessary Cookies</h4>
                        <p className="text-sm text-surface-600">
                          Required for the website to function. Cannot be disabled.
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-brand-500 rounded-full cursor-not-allowed opacity-75" />
                        <div className="absolute left-[22px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform" />
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <label className="flex items-center justify-between p-4 bg-surface-50 rounded-lg cursor-pointer hover:bg-surface-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-surface-900">Analytics Cookies</h4>
                        <p className="text-sm text-surface-600">
                          Help us understand how visitors interact with our website.
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) =>
                            setPreferences({ ...preferences, analytics: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-300 peer-checked:bg-brand-500 rounded-full transition-colors" />
                        <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-transform ${preferences.analytics ? "left-[22px]" : "left-[2px]"}`} />
                      </div>
                    </label>

                    {/* Marketing Cookies */}
                    <label className="flex items-center justify-between p-4 bg-surface-50 rounded-lg cursor-pointer hover:bg-surface-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-surface-900">Marketing Cookies</h4>
                        <p className="text-sm text-surface-600">
                          Used to deliver personalized advertisements.
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) =>
                            setPreferences({ ...preferences, marketing: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-300 peer-checked:bg-brand-500 rounded-full transition-colors" />
                        <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-transform ${preferences.marketing ? "left-[22px]" : "left-[2px]"}`} />
                      </div>
                    </label>

                    {/* Preference Cookies */}
                    <label className="flex items-center justify-between p-4 bg-surface-50 rounded-lg cursor-pointer hover:bg-surface-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-surface-900">Preference Cookies</h4>
                        <p className="text-sm text-surface-600">
                          Remember your settings and preferences.
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.preferences}
                          onChange={(e) =>
                            setPreferences({ ...preferences, preferences: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-300 peer-checked:bg-brand-500 rounded-full transition-colors" />
                        <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-transform ${preferences.preferences ? "left-[22px]" : "left-[2px]"}`} />
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button onClick={() => setShowSettings(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleSavePreferences} size="sm">
                      Save Preferences
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Types for gtag are declared in types/gtag.d.ts
