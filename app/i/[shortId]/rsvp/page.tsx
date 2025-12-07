"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InvitationData {
  id: string;
  title: string;
  eventDate: string;
  hostName: string;
  rsvpSettings: {
    enabled: boolean;
    deadline?: string;
    allowPlusOne?: boolean;
    plusOneLimit?: number;
    collectMealPreference?: boolean;
    mealOptions?: string[];
    collectDietaryRestrictions?: boolean;
  };
}

interface FormData {
  name: string;
  email: string;
  attending: "yes" | "no" | "maybe";
  guestCount: number;
  dietaryRestrictions: string;
  message: string;
}

export default function RSVPPage() {
  const params = useParams();
  const shortId = params.shortId as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    attending: "yes",
    guestCount: 1,
    dietaryRestrictions: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/public/invitation/${shortId}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error?.message || "Failed to load invitation");
          return;
        }

        setInvitation(result.data);
      } catch (err) {
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    }

    if (shortId) {
      fetchInvitation();
    }
  }, [shortId]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !invitation) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/rsvp/${invitation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to submit RSVP");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit RSVP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Error</h1>
          <p className="text-surface-600 mb-4">{error}</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Thank You!</h2>
            <p className="text-surface-600 mb-2">Your RSVP has been submitted.</p>
            {formData.attending === "yes" && (
              <p className="text-success-600 font-medium">We look forward to seeing you!</p>
            )}
            {formData.attending === "no" && (
              <p className="text-surface-500">We're sorry you can't make it.</p>
            )}
            {formData.attending === "maybe" && (
              <p className="text-surface-500">We hope you can make it!</p>
            )}
            <Link href={`/i/${shortId}`} className="block mt-6">
              <Button variant="outline">Back to Invitation</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  const maxGuests = invitation?.rsvpSettings.allowPlusOne
    ? (invitation.rsvpSettings.plusOneLimit || 1) + 1
    : 1;

  return (
    <div className="min-h-screen bg-surface-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/i/${shortId}`}
            className="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invitation
          </Link>
          <h1 className="text-2xl font-bold text-surface-900">{invitation?.title}</h1>
          <p className="text-surface-500">Hosted by {invitation?.hostName}</p>
        </div>

        {/* RSVP Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Attendance Selection */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-3">
                Will you attend? <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "yes", label: "Yes", icon: Check, color: "success" },
                  { value: "no", label: "No", icon: X, color: "error" },
                  { value: "maybe", label: "Maybe", icon: HelpCircle, color: "warning" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange("attending", option.value as FormData["attending"])}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      formData.attending === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : "border-surface-200 hover:border-surface-300"
                    )}
                  >
                    <option.icon
                      className={cn(
                        "h-6 w-6",
                        formData.attending === option.value
                          ? `text-${option.color}-600`
                          : "text-surface-400"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        formData.attending === option.value
                          ? `text-${option.color}-700`
                          : "text-surface-600"
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Your Name <span className="text-error-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your name"
                error={formErrors.name}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Email <span className="text-error-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="you@example.com"
                error={formErrors.email}
              />
            </div>

            {/* Guest Count */}
            {formData.attending === "yes" && invitation?.rsvpSettings.allowPlusOne && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Number of Guests
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("guestCount", Math.max(1, formData.guestCount - 1))
                    }
                    className="w-10 h-10 rounded-lg border border-surface-300 flex items-center justify-center hover:bg-surface-100"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">
                    {formData.guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("guestCount", Math.min(maxGuests, formData.guestCount + 1))
                    }
                    className="w-10 h-10 rounded-lg border border-surface-300 flex items-center justify-center hover:bg-surface-100"
                  >
                    +
                  </button>
                  <span className="text-sm text-surface-500">Max {maxGuests} guests</span>
                </div>
              </div>
            )}

            {/* Dietary Restrictions */}
            {formData.attending === "yes" && invitation?.rsvpSettings.collectDietaryRestrictions && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Dietary Restrictions
                </label>
                <Input
                  value={formData.dietaryRestrictions}
                  onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                  placeholder="Allergies, preferences, etc."
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Message (optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Any notes for the host..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <p className="text-xs text-surface-500 mt-1">{formData.message.length}/500</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit RSVP"}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-surface-500 mt-6">
          Powered by{" "}
          <Link href="/" className="text-brand-600 hover:underline">
            InviteGenerator
          </Link>
        </p>
      </div>
    </div>
  );
}
