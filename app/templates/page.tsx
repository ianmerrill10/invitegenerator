import { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Cake,
  Baby,
  Sparkles,
  GraduationCap,
  Building2,
  PartyPopper,
  Calendar,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema, SoftwareApplicationSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Invitation Templates | InviteGenerator",
  description: "Browse 300+ beautiful invitation templates for weddings, birthdays, baby showers, and more. Free to customize with AI-powered design tools.",
  alternates: {
    canonical: "/templates",
  },
  openGraph: {
    title: "Invitation Templates | InviteGenerator",
    description: "300+ beautiful templates for every occasion. Start creating for free.",
  },
};

const categories = [
  {
    id: "wedding",
    name: "Wedding",
    description: "Elegant invitations for your special day",
    icon: Heart,
    count: 48,
    color: "from-rose-500 to-pink-500",
    popular: true,
  },
  {
    id: "birthday",
    name: "Birthday",
    description: "Fun and festive birthday party invites",
    icon: Cake,
    count: 62,
    color: "from-pink-500 to-amber-500",
    popular: true,
  },
  {
    id: "baby-shower",
    name: "Baby Shower",
    description: "Sweet designs for the new arrival",
    icon: Baby,
    count: 35,
    color: "from-sky-500 to-blue-500",
    popular: true,
  },
  {
    id: "bridal-shower",
    name: "Bridal Shower",
    description: "Beautiful invites for the bride-to-be",
    icon: Sparkles,
    count: 28,
    color: "from-purple-500 to-violet-500",
    popular: false,
  },
  {
    id: "graduation",
    name: "Graduation",
    description: "Honor academic achievements",
    icon: GraduationCap,
    count: 24,
    color: "from-slate-500 to-slate-600",
    popular: false,
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional business event invitations",
    icon: Building2,
    count: 31,
    color: "from-slate-500 to-gray-600",
    popular: false,
  },
  {
    id: "holiday",
    name: "Holiday",
    description: "Seasonal celebrations and parties",
    icon: PartyPopper,
    count: 45,
    color: "from-red-500 to-rose-500",
    popular: true,
  },
  {
    id: "other",
    name: "Other Events",
    description: "Customizable for any occasion",
    icon: Calendar,
    count: 40,
    color: "from-indigo-500 to-blue-500",
    popular: false,
  },
];

// Sample featured templates for preview
const featuredTemplates = [
  { id: "1", name: "Elegant Rose Garden", category: "Wedding", style: "Classic" },
  { id: "2", name: "Modern Minimalist", category: "Wedding", style: "Modern" },
  { id: "3", name: "Balloon Celebration", category: "Birthday", style: "Playful" },
  { id: "4", name: "Golden Anniversary", category: "Birthday", style: "Elegant" },
  { id: "5", name: "Pastel Dream", category: "Baby Shower", style: "Soft" },
  { id: "6", name: "Little Prince", category: "Baby Shower", style: "Classic" },
  { id: "7", name: "Winter Wonderland", category: "Holiday", style: "Festive" },
  { id: "8", name: "Summer BBQ", category: "Holiday", style: "Casual" },
];

const styles = [
  "All Styles",
  "Modern",
  "Classic",
  "Playful",
  "Elegant",
  "Minimalist",
  "Rustic",
  "Bohemian",
  "Vintage",
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* JSON-LD Structured Data */}
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://invitegenerator.com" },
          { name: "Templates", url: "https://invitegenerator.com/templates" },
        ]}
      />
      <SoftwareApplicationSchema
        name="InviteGenerator Templates"
        description="Browse 300+ beautiful invitation templates for weddings, birthdays, baby showers, and more."
        applicationCategory="DesignApplication"
      />

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50 to-surface-50 pt-32 pb-16">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 mb-6">
              Beautiful Templates for{" "}
              <span className="text-brand-600">Every Occasion</span>
            </h1>
            <p className="text-xl text-surface-600 mb-8">
              Choose from 300+ professionally designed templates and customize them
              with our AI-powered editor. Free to start.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-surface-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Style Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {styles.map((style, index) => (
                <button
                  key={style}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    index === 0
                      ? "bg-brand-500 text-white"
                      : "bg-white text-surface-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold text-surface-900">
              Browse by Category
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/templates/${category.id}`}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-surface-200 hover:border-brand-200 hover:shadow-lg transition-all"
                >
                  {category.popular && (
                    <span className="absolute top-4 right-4 px-2 py-1 bg-brand-500 text-white text-xs font-medium rounded-full">
                      Popular
                    </span>
                  )}
                  <div className={`h-32 bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                    <Icon className="w-12 h-12 text-white/80" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-surface-600 mb-3">
                      {category.description}
                    </p>
                    <span className="text-sm text-brand-600 font-medium">
                      {category.count} templates
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-2">
                Featured Templates
              </h2>
              <p className="text-surface-600">
                Hand-picked designs loved by our community
              </p>
            </div>
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-surface-50 rounded-xl overflow-hidden border border-surface-200 hover:border-brand-200 hover:shadow-lg transition-all"
              >
                <div className="aspect-[5/7] bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center relative">
                  <Sparkles className="w-12 h-12 text-surface-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" variant="secondary">
                      Preview
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-surface-900 mb-1">
                    {template.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-surface-500">
                    <span>{template.category}</span>
                    <span>{template.style}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Generation CTA */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">AI-Powered</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Can&apos;t Find the Perfect Template?
            </h2>
            <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
              Let our AI create a unique design just for you. Describe your event and style
              preferences, and get a custom invitation in seconds.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/signup">
                <Sparkles className="w-4 h-4 mr-2" />
                Try AI Generation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-heading text-4xl font-bold text-brand-600 mb-2">
                300+
              </div>
              <p className="text-surface-600">Templates</p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold text-brand-600 mb-2">
                10+
              </div>
              <p className="text-surface-600">Categories</p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold text-brand-600 mb-2">
                500K+
              </div>
              <p className="text-surface-600">Invitations Created</p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold text-brand-600 mb-2">
                4.9/5
              </div>
              <p className="text-surface-600">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-surface-900">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your Invitation?
          </h2>
          <p className="text-surface-400 text-lg mb-8 max-w-2xl mx-auto">
            Sign up for free and start customizing any template. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-surface-600 text-white hover:bg-surface-800">
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
