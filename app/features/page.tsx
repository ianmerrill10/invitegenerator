"use client";

/**
 * Public Features Page
 *
 * Showcases all platform features and capabilities.
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wand2,
  Palette,
  Users,
  Share2,
  BarChart3,
  Globe,
  Lock,
  Zap,
  Layout,
  Download,
  Bell,
  Mail,
  Calendar,
  MessageSquare,
  Smartphone,
} from "lucide-react";

const features = [
  {
    category: "AI-Powered Creation",
    items: [
      {
        icon: Wand2,
        title: "AI Design Generation",
        description:
          "Describe your event and let AI create stunning invitation designs in seconds. Choose from multiple styles and customize to perfection.",
      },
      {
        icon: Sparkles,
        title: "Smart Suggestions",
        description:
          "Get intelligent recommendations for colors, fonts, and layouts based on your event type and preferences.",
      },
      {
        icon: MessageSquare,
        title: "AI Copywriting",
        description:
          "Generate perfect invitation wording with AI. From formal to casual, we'll help you find the right words.",
      },
    ],
  },
  {
    category: "Design & Customization",
    items: [
      {
        icon: Layout,
        title: "Visual Editor",
        description:
          "Drag-and-drop editor with real-time preview. Add text, images, shapes, and decorative elements with ease.",
      },
      {
        icon: Palette,
        title: "Custom Branding",
        description:
          "Use your own colors, fonts, and logos. Create invitations that match your personal style or brand identity.",
      },
      {
        icon: Download,
        title: "Multiple Export Formats",
        description:
          "Download as high-quality PNG, PDF for printing, or share directly as a web link.",
      },
    ],
  },
  {
    category: "RSVP Management",
    items: [
      {
        icon: Users,
        title: "Guest Tracking",
        description:
          "Track responses in real-time. See who's attending, who's declined, and who hasn't responded yet.",
      },
      {
        icon: BarChart3,
        title: "Response Analytics",
        description:
          "Get insights on response rates, dietary requirements, plus-ones, and more to help plan your event.",
      },
      {
        icon: Bell,
        title: "Automated Reminders",
        description:
          "Send automatic reminder emails to guests who haven't responded as your deadline approaches.",
      },
    ],
  },
  {
    category: "Sharing & Distribution",
    items: [
      {
        icon: Share2,
        title: "Shareable Links",
        description:
          "Get a unique, short URL for each invitation. Share via email, text, social media, or QR code.",
      },
      {
        icon: Mail,
        title: "Email Delivery",
        description:
          "Send invitations directly to your guest list. Track opens and clicks for each recipient.",
      },
      {
        icon: Smartphone,
        title: "Mobile Optimized",
        description:
          "Invitations look beautiful on any device. Responsive design ensures a great experience everywhere.",
      },
    ],
  },
  {
    category: "Event Planning",
    items: [
      {
        icon: Calendar,
        title: "Event Details",
        description:
          "Add all your event information in one place. Date, time, location with maps, dress code, and more.",
      },
      {
        icon: Globe,
        title: "Multiple Languages",
        description:
          "Create invitations in any language. Support for international characters and right-to-left text.",
      },
      {
        icon: Lock,
        title: "Privacy Controls",
        description:
          "Control who can view your invitation. Password protection and private link options available.",
      },
    ],
  },
];


export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="brand" className="mb-4">
              Platform Features
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-4">
              Everything You Need to Create
              <span className="text-brand-500"> Perfect Invitations</span>
            </h1>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto mb-8">
              From AI-powered design to comprehensive RSVP tracking, InviteGenerator
              has all the tools to make your event planning effortless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button variant="primary" size="lg">
                  Start Creating Free
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" size="lg">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>


        {/* Features Grid */}
        {features.map((section, sectionIndex) => (
          <section
            key={section.category}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-900 mb-8">
                {section.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {section.items.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full bg-white hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-brand-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-surface-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-surface-600">{feature.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-brand-500 to-brand-600 text-white text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Create Your First Invitation?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Create beautiful invitations with AI-powered design tools.
              It's free to get started, no credit card required!
            </p>
            <Link href="/auth/signup">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-brand-600 hover:bg-surface-50"
              >
                Get Started Free
              </Button>
            </Link>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
