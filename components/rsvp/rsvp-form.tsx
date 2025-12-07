"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, X, HelpCircle } from "lucide-react";

interface RSVPFormProps {
  invitationId: string;
  invitationTitle: string;
  allowPlusOne?: boolean;
  maxPlusOnes?: number;
  collectDietaryRestrictions?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormData {
  name: string;
  email: string;
  attending: "yes" | "no" | "maybe";
  guestCount: number;
  dietaryRestrictions: string;
  message: string;
}

export function RSVPForm({
  invitationId,
  invitationTitle,
  allowPlusOne = false,
  maxPlusOnes = 0,
  collectDietaryRestrictions = false,
  onSuccess,
  onError,
}: RSVPFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    attending: "yes",
    guestCount: 1,
    dietaryRestrictions: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/rsvp/${invitationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || "Failed to submit");
      }

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit";
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-success-500" />
        </div>
        <h3 className="text-xl font-semibold text-surface-900 mb-2">Thank You!</h3>
        <p className="text-surface-600">Your RSVP has been submitted.</p>
      </Card>
    );
  }

  const maxGuests = allowPlusOne ? maxPlusOnes + 1 : 1;

  return (
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
                <span className="font-medium">{option.label}</span>
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
            error={errors.name}
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
            error={errors.email}
          />
        </div>

        {/* Guest Count */}
        {formData.attending === "yes" && allowPlusOne && (
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Number of Guests
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleInputChange("guestCount", Math.max(1, formData.guestCount - 1))}
                className="w-10 h-10 rounded-lg border border-surface-300 flex items-center justify-center hover:bg-surface-100"
              >
                -
              </button>
              <span className="text-xl font-semibold w-8 text-center">{formData.guestCount}</span>
              <button
                type="button"
                onClick={() => handleInputChange("guestCount", Math.min(maxGuests, formData.guestCount + 1))}
                className="w-10 h-10 rounded-lg border border-surface-300 flex items-center justify-center hover:bg-surface-100"
              >
                +
              </button>
              <span className="text-sm text-surface-500">Max {maxGuests} guests</span>
            </div>
          </div>
        )}

        {/* Dietary Restrictions */}
        {formData.attending === "yes" && collectDietaryRestrictions && (
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

        {/* Submit */}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit RSVP"}
        </Button>
      </form>
    </Card>
  );
}
