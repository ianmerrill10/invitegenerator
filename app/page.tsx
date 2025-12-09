"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Users,
  Palette,
  Clock,
  Share2,
  CheckCircle2,
  ArrowRight,
  Star,
  Play,
  Mail,
  Heart,
  Calendar,
  Gift,
  Cake,
  PartyPopper,
  GraduationCap,
  Building,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRICING_PLANS, EVENT_CATEGORIES } from "@/lib/constants";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Feature data
const features = [
  {
    icon: Wand2,
    title: "AI-Powered Design",
    description:
      "Describe your event and let our AI create stunning, personalized invitations in seconds.",
    color: "brand",
  },
  {
    icon: Palette,
    title: "Beautiful Templates",
    description:
      "Choose from hundreds of professionally designed templates for any occasion.",
    color: "accent",
  },
  {
    icon: Users,
    title: "RSVP Tracking",
    description:
      "Easily track guest responses, meal preferences, and dietary requirements in one place.",
    color: "success",
  },
  {
    icon: Clock,
    title: "Save Time",
    description:
      "Create professional invitations in minutes, not hours. No design skills needed.",
    color: "warning",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description:
      "Share via email, link, or social media. Guests can RSVP with one click.",
    color: "brand",
  },
  {
    icon: CheckCircle2,
    title: "Free to Start",
    description:
      "Create your first 3 invitations completely free. No credit card required.",
    color: "accent",
  },
];


// Example use cases (clearly marked as illustrative examples, not real testimonials)
const useCases = [
  {
    scenario: "Wedding Planning",
    description:
      "Create elegant wedding invitations with AI-powered design suggestions tailored to your theme and color palette.",
    icon: Heart,
  },
  {
    scenario: "Corporate Events",
    description:
      "Design professional invitations for conferences, team events, or company celebrations in minutes.",
    icon: Building,
  },
  {
    scenario: "Birthday Parties",
    description:
      "Track RSVPs in real-time and manage guest lists effortlessly for any birthday celebration.",
    icon: Cake,
  },
];

// Event category icons
const categoryIcons: Record<string, React.ReactNode> = {
  wedding: <Heart className="h-6 w-6" />,
  birthday: <Cake className="h-6 w-6" />,
  baby_shower: <Gift className="h-6 w-6" />,
  corporate: <Building className="h-6 w-6" />,
  graduation: <GraduationCap className="h-6 w-6" />,
  holiday: <PartyPopper className="h-6 w-6" />,
};

export default function LandingPage() {
  return (
    <>
      <Header />

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20">
          {/* Background */}
          <div className="absolute inset-0 mesh-bg" />
          <div className="absolute inset-0 noise-overlay" />

          {/* Floating decorative elements */}
          <div className="absolute top-32 left-[10%] w-20 h-20 rounded-full bg-brand-200/30 blur-2xl animate-float" />
          <div className="absolute top-48 right-[15%] w-32 h-32 rounded-full bg-accent-200/30 blur-3xl animate-float animation-delay-200" />
          <div className="absolute bottom-32 left-[20%] w-24 h-24 rounded-full bg-warning-200/30 blur-2xl animate-float animation-delay-400" />

          <div className="container-custom relative py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Content */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="text-center lg:text-left"
              >
                {/* Badge */}
                <motion.div variants={fadeInUp} className="mb-6">
                  <Badge
                    variant="outline-primary"
                    size="lg"
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-brand-500" />
                    AI-Powered Invitation Generator
                  </Badge>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={fadeInUp}
                  className="font-display text-display-lg md:text-display-xl lg:text-display-2xl font-bold text-surface-900 mb-6 text-balance"
                >
                  Create{" "}
                  <span className="text-gradient">Stunning Invitations</span>{" "}
                  in Seconds
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  variants={fadeInUp}
                  className="text-lg md:text-xl text-surface-600 mb-8 max-w-xl mx-auto lg:mx-0"
                >
                  Design beautiful, professional invitations for any event using
                  AI. No design skills needed. Free to start.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Link href="/auth/signup">
                    <Button
                      size="xl"
                      leftIcon={<Sparkles className="h-5 w-5" />}
                      className="shadow-glow hover:shadow-glow-lg"
                    >
                      Create Free Invitation
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button
                      variant="outline"
                      size="xl"
                      leftIcon={<Play className="h-5 w-5" />}
                    >
                      Watch Demo
                    </Button>
                  </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  variants={fadeInUp}
                  className="mt-10 flex flex-wrap items-center gap-4 justify-center lg:justify-start text-sm text-surface-600"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    3 free invitations
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    AI-powered design
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                {/* Main invitation preview */}
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-accent-500/20 to-brand-500/20 rounded-3xl blur-2xl" />

                  {/* Card */}
                  <div className="relative bg-white rounded-2xl shadow-elevated p-6 border border-surface-200">
                    {/* Preview header */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="h-3 w-3" />
                        AI Generated
                      </Badge>
                      <span className="text-xs text-surface-400">
                        Created in 30 seconds
                      </span>
                    </div>

                    {/* Sample invitation */}
                    <div className="aspect-[5/7] bg-gradient-to-br from-brand-50 via-white to-accent-50 rounded-xl border border-surface-200 p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-brand-500" />
                      </div>
                      <h3 className="font-display text-2xl text-surface-900 mb-2">
                        You're Invited!
                      </h3>
                      <p className="text-surface-600 text-sm mb-4">
                        Join us for a celebration of love
                      </p>
                      <div className="text-xs text-surface-500 space-y-1">
                        <p className="font-semibold text-surface-700">
                          Sarah & Michael
                        </p>
                        <p>June 15, 2025 • 4:00 PM</p>
                        <p>The Grand Ballroom</p>
                      </div>
                      <div className="mt-4 px-4 py-2 bg-brand-500 text-white text-xs font-medium rounded-full">
                        RSVP Now
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
                      <span className="text-sm text-surface-600">
                        Wedding Invitation
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit Design
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -left-4 top-1/4 hidden lg:block"
                >
                  <Card variant="elevated" padding="sm" className="shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-success-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-success-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-surface-900">
                          42 RSVPs
                        </p>
                        <p className="text-xs text-surface-500">Today</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -right-4 bottom-1/4 hidden lg:block"
                >
                  <Card variant="elevated" padding="sm" className="shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-surface-900">
                          AI Ready
                        </p>
                        <p className="text-xs text-surface-500">Generate now</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
            <div className="w-6 h-10 rounded-full border-2 border-surface-300 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-surface-400 rounded-full animate-pulse" />
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section className="section bg-surface-50">
          <div className="container-custom">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <Badge variant="primary" className="mb-4">
                Features
              </Badge>
              <h2 className="font-display text-display-md md:text-display-lg font-bold text-surface-900 mb-4">
                Everything You Need to{" "}
                <span className="text-gradient">Create Perfect Invitations</span>
              </h2>
              <p className="text-lg text-surface-600">
                Powerful tools designed to make invitation creation effortless
                and enjoyable.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="hover" padding="lg" className="h-full">
                    <div
                      className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center mb-5",
                        feature.color === "brand" && "bg-brand-100",
                        feature.color === "accent" && "bg-accent-100",
                        feature.color === "success" && "bg-success-100",
                        feature.color === "warning" && "bg-warning-100"
                      )}
                    >
                      <feature.icon
                        className={cn(
                          "h-7 w-7",
                          feature.color === "brand" && "text-brand-600",
                          feature.color === "accent" && "text-accent-600",
                          feature.color === "success" && "text-success-600",
                          feature.color === "warning" && "text-warning-600"
                        )}
                      />
                    </div>
                    <h3 className="font-heading font-semibold text-xl text-surface-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-surface-600">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Event Categories Section */}
        <section className="section bg-white">
          <div className="container-custom">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <Badge variant="secondary" className="mb-4">
                Templates
              </Badge>
              <h2 className="font-display text-display-md md:text-display-lg font-bold text-surface-900 mb-4">
                Invitations for{" "}
                <span className="text-gradient-warm">Every Occasion</span>
              </h2>
              <p className="text-lg text-surface-600">
                Hundreds of templates designed for weddings, birthdays, corporate
                events, and more.
              </p>
            </motion.div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {EVENT_CATEGORIES.slice(0, 6).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/templates?category=${category.id}`}>
                    <Card
                      variant="interactive"
                      padding="md"
                      className="text-center h-full"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mx-auto mb-3 text-brand-600">
                        {categoryIcons[category.id] || (
                          <Calendar className="h-6 w-6" />
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-surface-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-surface-500">
                        View templates
                      </p>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-10">
              <Link href="/templates">
                <Button
                  variant="outline"
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Browse All Templates
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section bg-surface-900 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

          <div className="container-custom relative">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <Badge
                variant="outline"
                className="mb-4 border-surface-700 text-surface-300"
              >
                Use Cases
              </Badge>
              <h2 className="font-display text-display-md md:text-display-lg font-bold mb-4">
                Perfect for{" "}
                <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                  Any Event
                </span>
              </h2>
              <p className="text-lg text-surface-400">
                From intimate gatherings to large celebrations, create invitations that impress.
              </p>
            </motion.div>

            {/* Use Cases Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.scenario}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="bg-surface-800/50 border-surface-700 backdrop-blur h-full"
                    padding="lg"
                  >
                    {/* Icon */}
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mb-5">
                      <useCase.icon className="h-7 w-7 text-brand-400" />
                    </div>

                    {/* Scenario */}
                    <h3 className="font-heading font-semibold text-xl text-white mb-3">
                      {useCase.scenario}
                    </h3>

                    {/* Description */}
                    <p className="text-surface-400 leading-relaxed">
                      {useCase.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container-custom relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="font-display text-display-md md:text-display-lg font-bold mb-6">
                Ready to Create Your First Invitation?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Create beautiful invitations in minutes with AI-powered design.
                Start free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button
                    size="xl"
                    className="bg-white text-brand-600 hover:bg-surface-100 shadow-lg"
                    leftIcon={<Sparkles className="h-5 w-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  3 free invitations
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Real Platform Stats - Small and at the bottom */}
        <RealStats />
      </main>

      <Footer />
    </>
  );
}

// Component to fetch and display real platform statistics
function RealStats() {
  const [stats, setStats] = React.useState<{
    invitations: number;
    users: number;
    rsvps: number;
  } | null>(null);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        // Silently fail - stats are optional
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
  }, []);

  // Don't show anything if we don't have stats or all are zero
  if (!stats || (stats.invitations === 0 && stats.users === 0 && stats.rsvps === 0)) {
    return null;
  }

  return (
    <section className="py-6 bg-surface-100 border-t border-surface-200">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-surface-500">
          <span className="text-surface-400">Platform stats:</span>
          {stats.users > 0 && (
            <span>{stats.users.toLocaleString()} user{stats.users !== 1 ? "s" : ""}</span>
          )}
          {stats.invitations > 0 && (
            <span>{stats.invitations.toLocaleString()} invitation{stats.invitations !== 1 ? "s" : ""} created</span>
          )}
          {stats.rsvps > 0 && (
            <span>{stats.rsvps.toLocaleString()} RSVP{stats.rsvps !== 1 ? "s" : ""} collected</span>
          )}
        </div>
      </div>
    </section>
  );
}
