"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  MessageCircle,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Search,
  Sparkles,
  Users,
  Share2,
  Palette,
  CreditCard,
  Settings,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// FAQ Categories
const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        q: "How do I create my first invitation?",
        a: "Click 'Create New' from your dashboard and follow the step-by-step wizard. You can either use AI to generate a design or choose from our template library."
      },
      {
        q: "Can I customize templates?",
        a: "Yes! All templates are fully customizable. After selecting a template, use our drag-and-drop editor to change colors, fonts, images, and layout."
      },
      {
        q: "How do I share my invitation?",
        a: "Once published, you can share via email, social media, QR code, or a unique link. Go to your invitation and click 'Share' to see all options."
      },
    ]
  },
  {
    id: "ai-features",
    title: "AI Features",
    icon: Sparkles,
    questions: [
      {
        q: "How does AI generation work?",
        a: "Our AI uses your event details and style preferences to create unique invitation designs. Simply provide your event information and select your preferred aesthetic."
      },
      {
        q: "How many AI credits do I get?",
        a: "Free plans include 3 AI credits per month. Pro plans include unlimited AI generations. Credits refresh at the start of each billing cycle."
      },
      {
        q: "Can I regenerate if I don't like the result?",
        a: "Yes! You can regenerate with different style options. Each generation uses one AI credit."
      },
    ]
  },
  {
    id: "rsvp",
    title: "RSVP & Guests",
    icon: Users,
    questions: [
      {
        q: "How do guests RSVP?",
        a: "Guests receive a link to your invitation where they can view event details and submit their response. You'll be notified of each new RSVP."
      },
      {
        q: "Can guests bring plus-ones?",
        a: "Yes, you can enable plus-ones in your RSVP settings. Guests will be able to specify the number of additional guests they're bringing."
      },
      {
        q: "How do I export my guest list?",
        a: "Go to your invitation's RSVP page and click 'Export CSV' to download a spreadsheet of all responses."
      },
    ]
  },
  {
    id: "billing",
    title: "Plans & Billing",
    icon: CreditCard,
    questions: [
      {
        q: "What's included in the free plan?",
        a: "Free plans include 3 invitations, 3 AI credits per month, basic templates, and core features like RSVP tracking."
      },
      {
        q: "How do I upgrade my plan?",
        a: "Go to Settings > Billing to view available plans and upgrade. Your new features will be available immediately."
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period."
      },
    ]
  },
];

// Quick links
const quickLinks = [
  { title: "Create Invitation", href: "/dashboard/create", icon: Sparkles },
  { title: "Browse Templates", href: "/dashboard/templates", icon: Palette },
  { title: "Manage Guests", href: "/dashboard/rsvp", icon: Users },
  { title: "Account Settings", href: "/dashboard/settings", icon: Settings },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedQuestion, setExpandedQuestion] = React.useState<string | null>(null);

  // Filter FAQs based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return faqCategories;

    const query = searchQuery.toLowerCase();
    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(query) ||
            q.a.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-brand-600 to-accent-600 text-white">
        <div className="container max-w-5xl mx-auto px-4 py-16">
          <Link href="/dashboard" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl font-bold mb-4">
              How can we help?
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Find answers to common questions or get in touch with our support team
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white text-surface-900 border-0"
              />
            </div>
          </motion.div>
        </div>
      </header>

      <section className="container max-w-5xl mx-auto px-4 py-12">
        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-8 mb-12"
        >
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                    <link.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <span className="font-medium text-sm">{link.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (categoryIndex + 1) }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center gap-3 pb-4">
                  <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-surface-600" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y">
                    {category.questions.map((faq, index) => {
                      const questionId = `${category.id}-${index}`;
                      const isExpanded = expandedQuestion === questionId;

                      return (
                        <div key={index} className="py-4">
                          <button
                            type="button"
                            onClick={() => setExpandedQuestion(isExpanded ? null : questionId)}
                            className="flex items-start justify-between w-full text-left"
                            aria-expanded={isExpanded ? "true" : "false"}
                          >
                            <span className="font-medium pr-4">{faq.q}</span>
                            <ChevronRight
                              className={cn(
                                "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </button>
                          {isExpanded && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-3 text-muted-foreground"
                            >
                              {faq.a}
                            </motion.p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-surface-900 to-surface-800 text-white">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-2">
                Still need help?
              </h2>
              <p className="text-surface-300 mb-6">
                Our support team is here to help you with any questions
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button className="bg-white text-surface-900 hover:bg-surface-100">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
