"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Check, X, HelpCircle, Users, MessageSquare } from "lucide-react";

const rsvpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  response: z.enum(["attending", "not_attending", "maybe"]),
  guestCount: z.number().min(1).max(10).optional(),
  dietaryRestrictions: z.string().optional(),
  message: z.string().max(500).optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to continue",
  }).optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
  eventTitle: string;
  maxGuests?: number;
  showDietaryField?: boolean;
  showMessageField?: boolean;
  requireTerms?: boolean;
  termsText?: string;
  onSubmit: (data: RSVPFormData) => Promise<void>;
  className?: string;
}

export function RSVPForm({
  eventTitle,
  maxGuests = 5,
  showDietaryField = true,
  showMessageField = true,
  requireTerms = false,
  termsText,
  onSubmit,
  className,
}: RSVPFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      response: "attending",
      guestCount: 1,
    },
  });

  const response = watch("response");

  const handleFormSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(data);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit RSVP"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold mb-2">RSVP Submitted!</h3>
          <p className="text-muted-foreground">
            Thank you for your response. You&apos;ll receive a confirmation email
            shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>RSVP</CardTitle>
        <CardDescription>
          Let us know if you can attend {eventTitle}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Response Selection */}
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="RSVP Response">
            {[
              { value: "attending", label: "Attending", icon: Check, color: "success" },
              { value: "not_attending", label: "Can't Attend", icon: X, color: "destructive" },
              { value: "maybe", label: "Maybe", icon: HelpCircle, color: "warning" },
            ].map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={response === value ? "true" : "false"}
                aria-label={`RSVP ${label}`}
                onClick={() => setValue("response", value as RSVPFormData["response"])}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  response === value
                    ? `border-${color} bg-${color}/10`
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-6 w-6",
                    response === value ? `text-${color}` : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    response === value ? `text-${color}` : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Your name"
                aria-required="true"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p id="name-error" className="text-xs text-destructive" role="alert">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your@email.com"
                aria-required="true"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive" role="alert">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Guest Count - only show if attending */}
          {response === "attending" && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                Number of Guests
              </Label>
              <Select
                value={String(watch("guestCount") || 1)}
                onValueChange={(val) => setValue("guestCount", parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dietary Restrictions */}
          {showDietaryField && response === "attending" && (
            <div className="space-y-1.5">
              <Label htmlFor="dietary">Dietary Restrictions</Label>
              <Input
                id="dietary"
                {...register("dietaryRestrictions")}
                placeholder="e.g., Vegetarian, Gluten-free"
              />
            </div>
          )}

          {/* Message */}
          {showMessageField && (
            <div className="space-y-1.5">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Message (optional)
              </Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Any message for the host..."
                rows={3}
              />
            </div>
          )}

          {/* Terms Agreement */}
          {requireTerms && termsText && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                onCheckedChange={(checked) =>
                  setValue("agreeToTerms", checked === true)
                }
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                {termsText}
              </Label>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert" aria-live="polite">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Submitting...
              </>
            ) : (
              "Submit RSVP"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Quick RSVP buttons for email/message links
interface QuickRSVPProps {
  onRespond: (response: "attending" | "not_attending" | "maybe") => void;
  className?: string;
}

export function QuickRSVP({ onRespond, className }: QuickRSVPProps) {
  return (
    <div className={cn("flex gap-2", className)} role="group" aria-label="Quick RSVP Options">
      <Button
        variant="success"
        onClick={() => onRespond("attending")}
        className="flex-1"
        aria-label="Yes, I will attend"
      >
        <Check className="h-4 w-4 mr-2" aria-hidden="true" />
        Yes
      </Button>
      <Button
        variant="destructive"
        onClick={() => onRespond("not_attending")}
        className="flex-1"
        aria-label="No, I cannot attend"
      >
        <X className="h-4 w-4 mr-2" aria-hidden="true" />
        No
      </Button>
      <Button
        variant="outline"
        onClick={() => onRespond("maybe")}
        className="flex-1"
        aria-label="Maybe, I'm not sure yet"
      >
        <HelpCircle className="h-4 w-4 mr-2" aria-hidden="true" />
        Maybe
      </Button>
    </div>
  );
}
