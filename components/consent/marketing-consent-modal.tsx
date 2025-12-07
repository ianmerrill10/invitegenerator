"use client";

/**
 * Marketing Consent Modal
 *
 * Shown after social login or signup to collect explicit
 * consent for marketing communications and data usage.
 *
 * GDPR/CCPA COMPLIANCE:
 * - Clear explanation of data usage
 * - Granular consent options
 * - Easy opt-out mechanism
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Mail, Gift, Bell, Users, Check } from "lucide-react";
import Link from "next/link";

interface MarketingConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (consent: MarketingConsent) => Promise<void>;
  userName?: string;
}

export interface MarketingConsent {
  emailMarketing: boolean;
  productRecommendations: boolean;
  partnerOffers: boolean;
  eventReminders: boolean;
  dataSharing: boolean;
}

export function MarketingConsentModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
}: MarketingConsentModalProps) {
  const [consent, setConsent] = useState<MarketingConsent>({
    emailMarketing: true,
    productRecommendations: true,
    partnerOffers: true,
    eventReminders: true,
    dataSharing: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(consent);
      onClose();
    } catch (error) {
      console.error("Failed to save consent:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAll = async () => {
    const allConsent: MarketingConsent = {
      emailMarketing: true,
      productRecommendations: true,
      partnerOffers: true,
      eventReminders: true,
      dataSharing: true,
    };
    setSubmitting(true);
    try {
      await onSubmit(allConsent);
      onClose();
    } catch (error) {
      console.error("Failed to save consent:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const consentOptions = [
    {
      key: "emailMarketing" as const,
      icon: Mail,
      title: "Email Updates",
      description: "Receive tips, inspiration, and feature announcements",
    },
    {
      key: "productRecommendations" as const,
      icon: Gift,
      title: "Product Recommendations",
      description: "Get personalized product suggestions for your events",
    },
    {
      key: "partnerOffers" as const,
      icon: Users,
      title: "Partner Offers",
      description: "Exclusive deals from our trusted partners",
    },
    {
      key: "eventReminders" as const,
      icon: Bell,
      title: "Event Reminders",
      description: "Helpful reminders as your event approaches",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-display font-bold">
            Welcome{userName ? `, ${userName}` : ""}!
          </h2>
          <p className="mt-2 text-white/90">
            Let us know how we can best help you plan your events.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-surface-600 mb-6">
            We'd love to send you helpful content and personalized recommendations.
            You can change these preferences anytime in your{" "}
            <Link href="/dashboard/settings" className="text-brand-600 hover:underline">
              account settings
            </Link>
            .
          </p>

          {/* Consent Options */}
          <div className="space-y-4">
            {consentOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 hover:border-brand-300 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      consent[option.key]
                        ? "bg-brand-500 border-brand-500"
                        : "border-surface-300"
                    }`}
                  >
                    {consent[option.key] && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4 text-surface-400" />
                    <span className="font-medium text-surface-900">{option.title}</span>
                  </div>
                  <p className="text-sm text-surface-600 mt-1">{option.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={consent[option.key]}
                  onChange={(e) =>
                    setConsent((prev) => ({ ...prev, [option.key]: e.target.checked }))
                  }
                  className="sr-only"
                />
              </label>
            ))}

            {/* Data Sharing (separate for emphasis) */}
            <div className="pt-4 border-t border-surface-200">
              <label className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 hover:border-brand-300 cursor-pointer transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      consent.dataSharing
                        ? "bg-brand-500 border-brand-500"
                        : "border-surface-300"
                    }`}
                  >
                    {consent.dataSharing && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-surface-900">
                    Share with partners
                  </span>
                  <p className="text-sm text-surface-600 mt-1">
                    Allow us to share your event preferences with trusted partners
                    to provide better recommendations
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.dataSharing}
                  onChange={(e) =>
                    setConsent((prev) => ({ ...prev, dataSharing: e.target.checked }))
                  }
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              variant="primary"
              className="flex-1"
              disabled={submitting}
            >
              Accept All
            </Button>
            <Button
              onClick={handleSubmit}
              variant="outline"
              className="flex-1"
              disabled={submitting}
            >
              Save Preferences
            </Button>
          </div>

          <p className="mt-4 text-xs text-surface-500 text-center">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-brand-600 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
