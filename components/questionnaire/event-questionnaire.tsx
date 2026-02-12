"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Heart,
  Gift,
  Plane,
  Camera,
  Music,
  UtensilsCrossed,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EventType } from "@/types";
import type { EventQuestionnaire, WeddingStyle } from "@/types/questionnaire";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const questionnaireSchema = z.object({
  guestCount: z.number().min(1).optional(),
  estimatedBudget: z.number().min(0).optional(),
  venueBooked: z.boolean(),
  venueName: z.string().optional(),
  venueCity: z.string().optional(),
  venueState: z.string().optional(),
  needsPhotographer: z.boolean().optional(),
  needsCatering: z.boolean().optional(),
  needsFlorist: z.boolean().optional(),
  needsMusic: z.boolean().optional(),
  needsVenue: z.boolean().optional(),
  needsHoneymoon: z.boolean().optional(),
  weddingStyle: z
    .enum(["traditional", "modern", "rustic", "bohemian", "luxury", "destination"])
    .optional(),
  weddingTheme: z.string().optional(),
  honeymoonDestination: z.string().optional(),
  honeymoonBudget: z.number().optional(),
  birthdayAge: z.number().optional(),
  birthdayTheme: z.string().optional(),
  giftRegistryInterest: z.boolean().optional(),
  preferredGiftTypes: z.array(z.string()).optional(),
  outOfTownGuests: z.number().optional(),
  needsHotelBlock: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
});

type FormData = z.infer<typeof questionnaireSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EventQuestionnaireProps {
  invitationId: string;
  eventType: EventType;
  onComplete: (data: Partial<EventQuestionnaire>) => void;
  onSkip?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Multi-step questionnaire that collects customer data to power personalised
 * product recommendations and affiliate matching.  Presented to the user as
 * "helpful event planning recommendations".
 */
export function EventQuestionnaireComponent({
  invitationId,
  eventType,
  onComplete,
  onSkip,
}: EventQuestionnaireProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      venueBooked: false,
      giftRegistryInterest: false,
      needsHotelBlock: false,
      hasChildren: false,
      petFriendly: false,
    },
  });

  // -------------------------------------------------------------------------
  // Dynamic step definitions based on event type
  // -------------------------------------------------------------------------

  const steps = React.useMemo(() => {
    const baseSteps = [
      {
        id: "basics",
        title: "Event Basics",
        description: "Help us personalize your experience",
        icon: <Calendar className="h-6 w-6" />,
      },
    ];

    if (eventType === "wedding") {
      baseSteps.push(
        {
          id: "wedding-style",
          title: "Wedding Style",
          description: "Tell us about your vision",
          icon: <Heart className="h-6 w-6" />,
        },
        {
          id: "vendors",
          title: "Vendor Needs",
          description: "What services do you need?",
          icon: <Camera className="h-6 w-6" />,
        },
        {
          id: "honeymoon",
          title: "Honeymoon Plans",
          description: "Planning a getaway?",
          icon: <Plane className="h-6 w-6" />,
        }
      );
    }

    if (eventType === "birthday") {
      baseSteps.push({
        id: "birthday-details",
        title: "Birthday Details",
        description: "Make it special",
        icon: <Gift className="h-6 w-6" />,
      });
    }

    baseSteps.push({
      id: "recommendations",
      title: "Personalized Recommendations",
      description: "Get tailored suggestions",
      icon: <Sparkles className="h-6 w-6" />,
    });

    return baseSteps;
  }, [eventType]);

  // -------------------------------------------------------------------------
  // Navigation handlers
  // -------------------------------------------------------------------------

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onComplete({
        invitationId,
        eventType,
        ...data,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      } as Partial<EventQuestionnaire>);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------------

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "basics":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-surface-900">
              Let&apos;s plan the perfect event!
            </h2>
            <p className="text-surface-600">
              Answer a few quick questions so we can provide personalized
              recommendations and help make your event unforgettable.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    How many guests are you expecting?
                  </span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  {...register("guestCount", { valueAsNumber: true })}
                />
                <p className="text-xs text-surface-500 mt-1">
                  Helps us recommend appropriate vendors and venues
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  <span className="inline-flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    What&apos;s your estimated budget?
                  </span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 5000"
                  {...register("estimatedBudget", { valueAsNumber: true })}
                />
                <p className="text-xs text-surface-500 mt-1">
                  We&apos;ll show you options that fit your budget
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Do you have a venue booked?
                  </span>
                </label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={watch("venueBooked") === true ? "primary" : "outline"}
                    onClick={() => setValue("venueBooked", true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={watch("venueBooked") === false ? "primary" : "outline"}
                    onClick={() => setValue("venueBooked", false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              {watch("venueBooked") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <Input placeholder="Venue name" {...register("venueName")} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="City" {...register("venueCity")} />
                    <Input placeholder="State" {...register("venueState")} />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        );

      case "wedding-style":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-surface-900">
              What&apos;s your wedding style?
            </h2>
            <p className="text-surface-600">
              This helps us curate the perfect vendors and products for your
              special day.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {([
                { value: "traditional", label: "Traditional" },
                { value: "modern", label: "Modern" },
                { value: "rustic", label: "Rustic" },
                { value: "bohemian", label: "Bohemian" },
                { value: "luxury", label: "Luxury" },
                { value: "destination", label: "Destination" },
              ] as const).map((style) => (
                <Card
                  key={style.value}
                  padding="md"
                  variant={watch("weddingStyle") === style.value ? "elevated" : "hover"}
                  className={cn(
                    "cursor-pointer transition-all",
                    watch("weddingStyle") === style.value && "ring-2 ring-brand-500"
                  )}
                  onClick={() => setValue("weddingStyle", style.value as WeddingStyle)}
                >
                  <div className="text-center">
                    <div className="font-medium">{style.label}</div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Wedding theme or color scheme (optional)
              </label>
              <Input
                placeholder="e.g., Rustic Barn, Navy & Gold, Garden Romance"
                {...register("weddingTheme")}
              />
            </div>
          </div>
        );

      case "vendors":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-surface-900">
              What vendors do you need?
            </h2>
            <p className="text-surface-600">
              Check all that apply &mdash; we&apos;ll send you curated
              recommendations!
            </p>

            <div className="space-y-3">
              {([
                { key: "needsPhotographer" as const, label: "Photographer", icon: <Camera className="h-5 w-5" /> },
                { key: "needsCatering" as const, label: "Catering", icon: <UtensilsCrossed className="h-5 w-5" /> },
                { key: "needsFlorist" as const, label: "Florist", icon: <Heart className="h-5 w-5" /> },
                { key: "needsMusic" as const, label: "DJ or Band", icon: <Music className="h-5 w-5" /> },
                { key: "needsVenue" as const, label: "Venue", icon: <Home className="h-5 w-5" /> },
              ]).map((vendor) => (
                <Card
                  key={vendor.key}
                  padding="md"
                  variant="hover"
                  className={cn(
                    "cursor-pointer transition-all",
                    watch(vendor.key) && "ring-2 ring-brand-500 bg-brand-50"
                  )}
                  onClick={() => setValue(vendor.key, !watch(vendor.key))}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-brand-600">{vendor.icon}</div>
                    <div className="flex-1 font-medium">{vendor.label}</div>
                    {watch(vendor.key) && (
                      <Check className="h-5 w-5 text-brand-600" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "honeymoon":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-surface-900">
              Planning a honeymoon?
            </h2>
            <p className="text-surface-600">
              Let us help you find the perfect romantic getaway.
            </p>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Are you planning a honeymoon?
              </label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={watch("needsHoneymoon") === true ? "primary" : "outline"}
                  onClick={() => setValue("needsHoneymoon", true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={watch("needsHoneymoon") === false ? "primary" : "outline"}
                  onClick={() => setValue("needsHoneymoon", false)}
                >
                  Not yet
                </Button>
              </div>
            </div>

            {watch("needsHoneymoon") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Dream destination?
                  </label>
                  <Input
                    placeholder="e.g., Maldives, Hawaii, Italy"
                    {...register("honeymoonDestination")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Honeymoon budget
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    {...register("honeymoonBudget", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    We&apos;ll send you exclusive travel deals and packages
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "birthday-details":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-surface-900">
              Tell us about the birthday celebration!
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Age (optional)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  {...register("birthdayAge", { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Party theme
                </label>
                <Input
                  placeholder="e.g., 80s retro, tropical, masquerade"
                  {...register("birthdayTheme")}
                />
              </div>
            </div>
          </div>
        );

      case "recommendations":
        return (
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100">
              <Sparkles className="h-8 w-8 text-brand-600" />
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-surface-900 mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-surface-600">
                Based on your answers, we&apos;ll create a personalized
                shopping experience with hand-picked recommendations for your
                event.
              </p>
            </div>

            <Card padding="lg" className="bg-brand-50 border-brand-200">
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-brand-600 mt-0.5" />
                  <p className="text-sm text-surface-700">
                    Curated vendor recommendations matching your style and
                    budget
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-brand-600 mt-0.5" />
                  <p className="text-sm text-surface-700">
                    Exclusive deals and discounts from our partners
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-brand-600 mt-0.5" />
                  <p className="text-sm text-surface-700">
                    Personalized email tips and inspiration
                  </p>
                </div>
              </div>
            </Card>

            <p className="text-xs text-surface-500">
              By completing this questionnaire, you agree to receive
              personalized product recommendations and marketing
              communications. You can opt-out anytime.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-surface-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          {onSkip && currentStep === 0 && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip for now
            </Button>
          )}
        </div>
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card padding="lg">{renderStepContent()}</Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={isSubmitting}
          rightIcon={
            currentStep === steps.length - 1 ? (
              <Check className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          }
        >
          {isSubmitting
            ? "Saving..."
            : currentStep === steps.length - 1
            ? "Complete"
            : "Continue"}
        </Button>
      </div>
    </div>
  );
}
