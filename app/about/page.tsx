import { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles, Users, Shield } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | InviteGenerator",
  description: "Learn about InviteGenerator's mission to help people create beautiful invitations for life's special moments using AI-powered design.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | InviteGenerator",
    description: "Our mission is to help you celebrate life's special moments with beautiful, AI-powered invitations.",
  },
};

const values = [
  {
    icon: Heart,
    title: "Celebration-First",
    description: "Every feature we build starts with one question: does this help people celebrate better?",
  },
  {
    icon: Sparkles,
    title: "Design Excellence",
    description: "We believe everyone deserves beautiful invitations, regardless of design experience.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Our roadmap is shaped by the thousands of events our users create every month.",
  },
  {
    icon: Shield,
    title: "Privacy-Focused",
    description: "Your data is yours. We never sell personal information or share it without consent.",
  },
];

const stats = [
  { value: "500K+", label: "Invitations Created" },
  { value: "50K+", label: "Happy Users" },
  { value: "2M+", label: "RSVPs Collected" },
  { value: "99.9%", label: "Uptime" },
];

const milestones = [
  {
    year: "2024",
    title: "Launch",
    description: "InviteGenerator launches with AI-powered invitation generation.",
  },
  {
    year: "2024",
    title: "RSVP Management",
    description: "Added comprehensive RSVP tracking and guest management.",
  },
  {
    year: "2024",
    title: "Premium Templates",
    description: "Launched 300+ professionally designed templates.",
  },
  {
    year: "2025",
    title: "AI 2.0",
    description: "Next-generation AI with enhanced personalization and style matching.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50 to-surface-50 pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 mb-6">
              Helping the World Celebrate{" "}
              <span className="text-brand-600">Life&apos;s Moments</span>
            </h1>
            <p className="text-xl text-surface-600 mb-8">
              We&apos;re on a mission to make beautiful invitations accessible to everyone,
              powered by AI and driven by a passion for celebration.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-surface-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-brand-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-surface-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-surface-600">
                <p>
                  InviteGenerator was born from a simple observation: creating beautiful
                  invitations shouldn&apos;t require expensive design software, professional
                  skills, or hours of your time.
                </p>
                <p>
                  We saw people struggle with generic templates that didn&apos;t capture the
                  spirit of their events, or spending too much on designers for simple
                  invitations. There had to be a better way.
                </p>
                <p>
                  By combining AI technology with thoughtful design, we&apos;ve created a
                  platform that understands your event and generates invitations that
                  feel personal, professional, and perfectly suited to your celebration.
                </p>
                <p>
                  Today, we&apos;re proud to help hundreds of thousands of people create
                  invitations for weddings, birthdays, baby showers, corporate events,
                  and everything in between.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl aspect-square flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-10 h-10 text-brand-600" />
                </div>
                <p className="text-brand-700 font-medium">
                  Making every invitation special
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Our Values
            </h2>
            <p className="text-surface-600">
              These principles guide everything we do, from product decisions to
              customer support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-brand-600" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-surface-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-surface-600 text-sm">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Our Journey
            </h2>
            <p className="text-surface-600">
              Key milestones in our mission to transform invitation creation.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-200 -translate-x-1/2" />

              {milestones.map((milestone, index) => (
                <div
                  key={milestone.title}
                  className={`relative flex items-center gap-8 mb-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"} pl-12 md:pl-0`}>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-surface-200">
                      <span className="text-brand-600 font-semibold text-sm">
                        {milestone.year}
                      </span>
                      <h3 className="font-heading text-lg font-semibold text-surface-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-surface-600 text-sm">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-brand-500 rounded-full -translate-x-1/2 border-4 border-white shadow" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-700">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Something Beautiful?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of thousands of people who use InviteGenerator to create
            stunning invitations for their special moments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/signup">
                Get Started Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
