"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Layout,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Type,
  Wand2,
  CheckCircle2,
  Loader2,
  Heart,
  Cake,
  Gift,
  Building,
  GraduationCap,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useInvitationStore, useAuthStore } from "@/lib/stores";
import { EVENT_CATEGORIES, AI_STYLES } from "@/lib/constants";
import type { EventType, CreateInvitationFormData } from "@/types";

// Form validation schema
const createInvitationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  eventType: z.string().min(1, "Please select an event type"),
  eventDate: z.string().min(1, "Please select a date"),
  eventTime: z.string().optional(),
  hostName: z.string().min(2, "Host name is required"),
  location: z.object({
    name: z.string().min(1, "Venue name is required"),
    address: z.string().optional(),
    city: z.string().optional(),
    virtual: z.boolean().optional(),
    virtualLink: z.string().optional(),
  }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof createInvitationSchema>;

// Event type icons
const eventTypeIcons: Record<string, React.ReactNode> = {
  wedding: <Heart className="h-6 w-6" />,
  birthday: <Cake className="h-6 w-6" />,
  baby_shower: <Gift className="h-6 w-6" />,
  bridal_shower: <Sparkles className="h-6 w-6" />,
  corporate: <Building className="h-6 w-6" />,
  graduation: <GraduationCap className="h-6 w-6" />,
  holiday: <PartyPopper className="h-6 w-6" />,
  dinner_party: <Calendar className="h-6 w-6" />,
  other: <Calendar className="h-6 w-6" />,
};

// Steps definition
const steps = [
  { id: 1, title: "Event Type", description: "What are you celebrating?" },
  { id: 2, title: "Event Details", description: "When and where?" },
  { id: 3, title: "Design Style", description: "How should it look?" },
];

export default function CreateInvitationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createInvitation, isLoading } = useInvitationStore();
  
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedEventType, setSelectedEventType] = React.useState<EventType | null>(null);
  const [creationMethod, setCreationMethod] = React.useState<"ai" | "template" | null>(null);
  const [aiStyle, setAiStyle] = React.useState({
    aesthetic: "modern",
    formality: "semi-formal",
    colorScheme: "warm",
  });
  const [isGenerating, setIsGenerating] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      title: "",
      eventType: "",
      eventDate: "",
      eventTime: "",
      hostName: user?.name || "",
      location: {
        name: "",
        address: "",
        city: "",
        virtual: false,
        virtualLink: "",
      },
      description: "",
    },
  });

  // Handle event type selection
  const handleEventTypeSelect = (type: EventType) => {
    setSelectedEventType(type);
    setValue("eventType", type);
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);

      // If using AI, call AI generation endpoint
      if (creationMethod === "ai") {
        toast.loading("AI is creating your invitation...");

        // Simulate AI generation (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        toast.dismiss();
      }

      // Create invitation
      const invitation = await createInvitation({
        ...data,
        eventType: data.eventType as EventType,
        location: data.location,
      } as CreateInvitationFormData);

      toast.success("Invitation created successfully!");
      router.push(`/dashboard/invitations/${invitation.id}/edit`);
    } catch (error) {
      toast.error("Failed to create invitation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mb-4"
        >
          Back
        </Button>
        <h1 className="font-display text-3xl font-bold text-surface-900 mb-2">
          Create New Invitation
        </h1>
        <p className="text-surface-600">
          Let's create something beautiful for your event
        </p>
      </div>

      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center font-heading font-semibold transition-colors",
                    currentStep >= step.id
                      ? "bg-brand-500 text-white"
                      : "bg-surface-200 text-surface-500"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={cn(
                      "font-heading font-medium",
                      currentStep >= step.id
                        ? "text-surface-900"
                        : "text-surface-500"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-surface-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-4 rounded-full transition-colors",
                    currentStep > step.id ? "bg-brand-500" : "bg-surface-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Event Type */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="lg">
                <h2 className="font-heading font-semibold text-xl text-surface-900 mb-6">
                  What type of event is this?
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {EVENT_CATEGORIES.slice(0, 9).map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleEventTypeSelect(category.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        selectedEventType === category.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-surface-200 hover:border-surface-300 hover:bg-surface-50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center mb-3",
                          selectedEventType === category.id
                            ? "bg-brand-100 text-brand-600"
                            : "bg-surface-100 text-surface-600"
                        )}
                      >
                        {eventTypeIcons[category.id] || <Calendar className="h-6 w-6" />}
                      </div>
                      <h3 className="font-heading font-semibold text-surface-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-surface-500 mt-1">
                        View templates
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!selectedEventType}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Event Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="lg">
                <h2 className="font-heading font-semibold text-xl text-surface-900 mb-6">
                  Tell us about your event
                </h2>

                <div className="space-y-5">
                  {/* Title */}
                  <div className="space-y-2">
                    <label htmlFor="title" className="label">
                      Event Title
                    </label>
                    <Input
                      id="title"
                      placeholder="e.g., Sarah & Michael's Wedding"
                      leftIcon={<Type className="h-5 w-5" />}
                      error={errors.title?.message}
                      {...register("title")}
                    />
                  </div>

                  {/* Host name */}
                  <div className="space-y-2">
                    <label htmlFor="hostName" className="label">
                      Host Name
                    </label>
                    <Input
                      id="hostName"
                      placeholder="Your name or organization"
                      leftIcon={<User className="h-5 w-5" />}
                      error={errors.hostName?.message}
                      {...register("hostName")}
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="eventDate" className="label">
                        Event Date
                      </label>
                      <Input
                        id="eventDate"
                        type="date"
                        leftIcon={<Calendar className="h-5 w-5" />}
                        error={errors.eventDate?.message}
                        {...register("eventDate")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="eventTime" className="label">
                        Event Time (optional)
                      </label>
                      <Input
                        id="eventTime"
                        type="time"
                        leftIcon={<Clock className="h-5 w-5" />}
                        {...register("eventTime")}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="locationName" className="label">
                      Venue Name
                    </label>
                    <Input
                      id="locationName"
                      placeholder="e.g., The Grand Ballroom"
                      leftIcon={<MapPin className="h-5 w-5" />}
                      error={errors.location?.name?.message}
                      {...register("location.name")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="locationAddress" className="label">
                      Address (optional)
                    </label>
                    <Input
                      id="locationAddress"
                      placeholder="123 Main St, City, State"
                      {...register("location.address")}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="label">
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      placeholder="Add any additional details about your event..."
                      className="flex w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-surface-900 font-body text-base transition-colors placeholder:text-surface-400 hover:border-surface-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                      {...register("description")}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Design Style */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="lg">
                <h2 className="font-heading font-semibold text-xl text-surface-900 mb-6">
                  How would you like to create your invitation?
                </h2>

                {/* Creation method selection */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setCreationMethod("ai")}
                    className={cn(
                      "p-6 rounded-xl border-2 text-left transition-all",
                      creationMethod === "ai"
                        ? "border-brand-500 bg-brand-50"
                        : "border-surface-200 hover:border-surface-300"
                    )}
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-4 text-white">
                      <Wand2 className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-surface-900 mb-1">
                      Generate with AI
                    </h3>
                    <p className="text-surface-500">
                      Let our AI create a unique design based on your preferences
                    </p>
                    <Badge variant="primary" className="mt-3">
                      <Sparkles className="h-3 w-3" />
                      Uses 1 AI Credit
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreationMethod("template")}
                    className={cn(
                      "p-6 rounded-xl border-2 text-left transition-all",
                      creationMethod === "template"
                        ? "border-brand-500 bg-brand-50"
                        : "border-surface-200 hover:border-surface-300"
                    )}
                  >
                    <div className="h-14 w-14 rounded-xl bg-surface-100 flex items-center justify-center mb-4 text-surface-600">
                      <Layout className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-surface-900 mb-1">
                      Choose a Template
                    </h3>
                    <p className="text-surface-500">
                      Browse our library of professionally designed templates
                    </p>
                    <Badge variant="default" className="mt-3">
                      Free
                    </Badge>
                  </button>
                </div>

                {/* AI Style options (only shown when AI is selected) */}
                {creationMethod === "ai" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-6 mb-8"
                  >
                    <div className="border-t border-surface-200 pt-6">
                      <h3 className="font-heading font-semibold text-surface-900 mb-4">
                        Customize AI Style
                      </h3>

                      {/* Aesthetic */}
                      <div className="mb-4">
                        <label className="label mb-2">Design Aesthetic</label>
                        <div className="flex flex-wrap gap-2">
                          {AI_STYLES.aesthetic.map((style) => (
                            <button
                              key={style.value}
                              type="button"
                              onClick={() =>
                                setAiStyle({ ...aiStyle, aesthetic: style.value })
                              }
                              className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                aiStyle.aesthetic === style.value
                                  ? "bg-brand-500 text-white"
                                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                              )}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Formality */}
                      <div className="mb-4">
                        <label className="label mb-2">Formality</label>
                        <div className="flex flex-wrap gap-2">
                          {AI_STYLES.formality.map((style) => (
                            <button
                              key={style.value}
                              type="button"
                              onClick={() =>
                                setAiStyle({ ...aiStyle, formality: style.value })
                              }
                              className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                aiStyle.formality === style.value
                                  ? "bg-brand-500 text-white"
                                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                              )}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Scheme */}
                      <div>
                        <label className="label mb-2">Color Scheme</label>
                        <div className="flex flex-wrap gap-2">
                          {AI_STYLES.colorScheme.map((style) => (
                            <button
                              key={style.value}
                              type="button"
                              onClick={() =>
                                setAiStyle({ ...aiStyle, colorScheme: style.value })
                              }
                              className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                aiStyle.colorScheme === style.value
                                  ? "bg-brand-500 text-white"
                                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                              )}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!creationMethod || isLoading || isGenerating}
                    loading={isGenerating}
                    leftIcon={
                      creationMethod === "ai" ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <Layout className="h-4 w-4" />
                      )
                    }
                  >
                    {creationMethod === "ai"
                      ? "Generate with AI"
                      : "Choose Template"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
