"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Palette,
  Send,
  Users,
  CheckCircle,
  ArrowRight,
  MousePointer,
  Wand2,
  Share2,
  BarChart3,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Choose Your Template",
    description:
      "Browse our collection of 1,050+ professionally designed templates. Filter by event type, style, or color scheme to find the perfect match for your occasion.",
    icon: Palette,
    features: [
      "Wedding, birthday, baby shower & more",
      "Multiple design styles",
      "Customizable color palettes",
    ],
  },
  {
    number: "02",
    title: "Customize with AI",
    description:
      "Our AI-powered editor helps you personalize every detail. Simply describe what you want, and watch your invitation come to life in seconds.",
    icon: Wand2,
    features: [
      "AI-generated text suggestions",
      "Smart layout adjustments",
      "One-click style changes",
    ],
  },
  {
    number: "03",
    title: "Share Instantly",
    description:
      "Send your invitation via email, share a link, or post directly to social media. Guests can view and RSVP from any device.",
    icon: Share2,
    features: [
      "Email delivery with tracking",
      "Shareable unique links",
      "Social media integration",
    ],
  },
  {
    number: "04",
    title: "Track Responses",
    description:
      "Monitor RSVPs in real-time with our intuitive dashboard. See who's coming, dietary requirements, plus ones, and more.",
    icon: BarChart3,
    features: [
      "Real-time RSVP tracking",
      "Guest meal preferences",
      "Export guest list to CSV",
    ],
  },
];

const benefits = [
  {
    icon: CheckCircle,
    title: "Free to Start",
    description: "Create your first 3 invitations completely free. No credit card required.",
  },
  {
    icon: MousePointer,
    title: "No Design Skills Needed",
    description: "Our templates and AI do the heavy lifting. You just add your details.",
  },
  {
    icon: Sparkles,
    title: "Professional Results",
    description: "Every invitation looks like it was designed by a professional.",
  },
  {
    icon: Users,
    title: "Unlimited Guests",
    description: "Invite as many guests as you need. No per-guest fees.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-50 pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-brand-50 to-surface-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="secondary" className="mb-4">
                Simple 4-Step Process
              </Badge>
              <h1 className="text-display-lg font-display font-bold text-surface-900 mb-6">
                How It Works
              </h1>
              <p className="text-xl text-surface-600 mb-8">
                Create stunning digital invitations in minutes. No design experience
                required. Just choose, customize, share, and track.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-24">
          <div className="container-custom">
            <div className="space-y-16 md:space-y-24">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`flex flex-col ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    } items-center gap-8 lg:gap-16`}
                  >
                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <span className="text-5xl font-display font-bold text-brand-200">
                          {step.number}
                        </span>
                        <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-brand-600" />
                        </div>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-heading font-bold text-surface-900 mb-4">
                        {step.title}
                      </h2>
                      <p className="text-lg text-surface-600 mb-6">
                        {step.description}
                      </p>
                      <ul className="space-y-3">
                        {step.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 text-surface-700 justify-center lg:justify-start"
                          >
                            <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual */}
                    <div className="flex-1 w-full max-w-md lg:max-w-none">
                      <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 p-8 flex items-center justify-center">
                        <div className="absolute inset-4 bg-white rounded-xl shadow-lg flex items-center justify-center">
                          <Icon className="h-20 w-20 text-brand-300" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-surface-900 mb-4">
                Why Choose InviteGenerator?
              </h2>
              <p className="text-lg text-surface-600 max-w-2xl mx-auto">
                Everything you need to create beautiful invitations and manage your
                guest list in one place.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full text-center p-6">
                      <CardContent className="p-0">
                        <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                          <Icon className="h-6 w-6 text-brand-600" />
                        </div>
                        <h3 className="font-heading font-semibold text-surface-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-surface-600">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-brand-500 to-brand-600">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to Create Your First Invitation?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Create beautiful invitations with AI-powered design.
                Start for free today, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-brand-600 border-white hover:bg-white/90"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    Browse Templates
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
