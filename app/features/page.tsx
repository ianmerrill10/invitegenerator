import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  Users,
  Share2,
  QrCode,
  Download,
  BarChart3,
  Clock,
  Mail,
  Image,
  Wand2,
  Layout,
  Globe,
  Shield,
  Zap,
  MessageSquare,
  Check,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features | InviteGenerator",
  description: "Explore all the powerful features of InviteGenerator - AI-powered design, RSVP management, beautiful templates, and more.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features | InviteGenerator",
    description: "Create stunning invitations with AI, manage RSVPs, and share everywhere.",
  },
};

const mainFeatures = [
  {
    icon: Sparkles,
    title: "AI-Powered Design",
    description: "Let our AI create unique, personalized invitation designs based on your event details and style preferences.",
    color: "from-purple-500 to-pink-500",
    details: [
      "Describe your event and get instant designs",
      "Multiple style options (modern, classic, playful)",
      "Smart color and font matching",
      "Continuous learning for better results",
    ],
  },
  {
    icon: Layout,
    title: "300+ Premium Templates",
    description: "Choose from hundreds of professionally designed templates for every occasion.",
    color: "from-blue-500 to-cyan-500",
    details: [
      "Wedding, birthday, baby shower, and more",
      "Fully customizable designs",
      "New templates added weekly",
      "Filter by style, color, and occasion",
    ],
  },
  {
    icon: Users,
    title: "Smart RSVP Management",
    description: "Track responses, manage guest lists, and export data with our comprehensive RSVP system.",
    color: "from-slate-500 to-slate-600",
    details: [
      "Real-time response tracking",
      "Meal preference collection",
      "Dietary restriction handling",
      "Export to CSV or Excel",
    ],
  },
  {
    icon: Share2,
    title: "Share Anywhere",
    description: "Share your invitations via email, social media, messaging apps, or print-ready PDFs.",
    color: "from-pink-500 to-red-500",
    details: [
      "Unique shareable links",
      "Social media optimization",
      "QR code generation",
      "Print-ready exports",
    ],
  },
];

const additionalFeatures = [
  {
    icon: Wand2,
    title: "Drag-and-Drop Editor",
    description: "Intuitive editor for customizing every element of your invitation.",
  },
  {
    icon: Image,
    title: "Image Library",
    description: "Access thousands of free stock images or upload your own photos.",
  },
  {
    icon: Palette,
    title: "Custom Colors & Fonts",
    description: "Choose from curated palettes or create your own color scheme.",
  },
  {
    icon: Clock,
    title: "RSVP Deadlines",
    description: "Set custom deadlines and send automatic reminders to guests.",
  },
  {
    icon: QrCode,
    title: "QR Code Generation",
    description: "Generate QR codes for easy mobile access to your invitations.",
  },
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Download as PNG, JPG, or print-ready PDF in various sizes.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track views, clicks, and engagement with detailed analytics.",
  },
  {
    icon: Mail,
    title: "Email Reminders",
    description: "Automatically remind guests who haven't responded yet.",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description: "Use your own domain for a professional branded experience.",
  },
  {
    icon: Shield,
    title: "Privacy Controls",
    description: "Control who can view and respond to your invitations.",
  },
  {
    icon: Zap,
    title: "Instant Publishing",
    description: "Your invitation is live and shareable within seconds.",
  },
  {
    icon: MessageSquare,
    title: "Guest Messaging",
    description: "Communicate with your guests directly through the platform.",
  },
];

const comparisonFeatures = [
  { name: "AI Invitation Generation", free: true, starter: true, pro: true, business: true },
  { name: "Premium Templates", free: false, starter: true, pro: true, business: true },
  { name: "RSVP Tracking", free: true, starter: true, pro: true, business: true },
  { name: "Custom Branding", free: false, starter: false, pro: true, business: true },
  { name: "Analytics Dashboard", free: false, starter: true, pro: true, business: true },
  { name: "Custom Domain", free: false, starter: false, pro: true, business: true },
  { name: "API Access", free: false, starter: false, pro: false, business: true },
  { name: "Priority Support", free: false, starter: false, pro: true, business: true },
  { name: "Team Collaboration", free: false, starter: false, pro: true, business: true },
  { name: "White-Label Options", free: false, starter: false, pro: false, business: true },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50 to-surface-50 pt-32 pb-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 mb-6">
              Everything You Need to Create{" "}
              <span className="text-brand-600">Perfect Invitations</span>
            </h1>
            <p className="text-xl text-surface-600 mb-8">
              Powerful AI, beautiful templates, and smart management tools - all in one platform
              designed to make your events unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Powerful Features for Every Event
            </h2>
            <p className="text-surface-600">
              From AI-powered design to comprehensive guest management, we have everything you need.
            </p>
          </div>

          <div className="space-y-24">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isReversed = index % 2 === 1;
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}
                >
                  <div className="flex-1">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-surface-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-surface-600 mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-slate-600" />
                          </div>
                          <span className="text-surface-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <div className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${feature.color} opacity-10 flex items-center justify-center`}>
                      <Icon className="w-24 h-24 text-surface-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              And Much More
            </h2>
            <p className="text-surface-600">
              Every feature you need to create, share, and manage your invitations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {additionalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl border border-surface-200 hover:border-brand-200 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="font-heading font-semibold text-surface-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-surface-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-surface-600">
              Find the perfect plan for your needs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-4 px-4 font-heading font-semibold text-surface-900">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-heading font-semibold text-surface-900">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 font-heading font-semibold text-surface-900">
                    Starter
                  </th>
                  <th className="text-center py-4 px-4 font-heading font-semibold text-brand-600 bg-brand-50 rounded-t-lg">
                    Pro
                  </th>
                  <th className="text-center py-4 px-4 font-heading font-semibold text-surface-900">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={index % 2 === 0 ? "bg-surface-50" : ""}
                  >
                    <td className="py-4 px-4 text-surface-700">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-slate-500 mx-auto" />
                      ) : (
                        <span className="text-surface-300">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {feature.starter ? (
                        <Check className="w-5 h-5 text-slate-500 mx-auto" />
                      ) : (
                        <span className="text-surface-300">—</span>
                      )}
                    </td>
                    <td className={`text-center py-4 px-4 ${index % 2 === 0 ? "bg-brand-50/50" : "bg-brand-50"}`}>
                      {feature.pro ? (
                        <Check className="w-5 h-5 text-slate-500 mx-auto" />
                      ) : (
                        <span className="text-surface-300">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {feature.business ? (
                        <Check className="w-5 h-5 text-slate-500 mx-auto" />
                      ) : (
                        <span className="text-surface-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/pricing">View Full Pricing Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-700">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your First Invitation?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who create beautiful invitations with InviteGenerator every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/signup">
                Start Creating for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
