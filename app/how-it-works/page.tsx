import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  Share2,
  Users,
  ArrowRight,
  CheckCircle,
  Play,
  MousePointer,
  Wand2,
  Eye,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works | InviteGenerator",
  description: "Learn how to create stunning invitations in minutes with InviteGenerator. Simple 4-step process: Choose, Customize, Share, Track.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: "How It Works | InviteGenerator",
    description: "Create beautiful invitations in 4 easy steps with AI-powered design.",
  },
};

const steps = [
  {
    number: "01",
    icon: MousePointer,
    title: "Choose Your Starting Point",
    description: "Pick from 300+ professionally designed templates or let our AI generate a unique design based on your event details.",
    color: "from-blue-500 to-cyan-500",
    details: [
      "Browse templates by event type",
      "Filter by style, color, and theme",
      "Or describe your event for AI generation",
    ],
  },
  {
    number: "02",
    icon: Palette,
    title: "Customize Your Design",
    description: "Use our intuitive drag-and-drop editor to personalize every element - colors, fonts, images, and layout.",
    color: "from-purple-500 to-pink-500",
    details: [
      "Change colors and fonts instantly",
      "Add your own photos and graphics",
      "Adjust layout and spacing",
      "Preview in real-time",
    ],
  },
  {
    number: "03",
    icon: Share2,
    title: "Share with Guests",
    description: "Publish your invitation and share via email, social media, messaging apps, or QR code - whatever works best for your guests.",
    color: "from-pink-500 to-red-500",
    details: [
      "Get a unique shareable link",
      "Share on social media",
      "Generate QR codes",
      "Download for printing",
    ],
  },
  {
    number: "04",
    icon: Users,
    title: "Track & Manage RSVPs",
    description: "Watch responses roll in with our real-time RSVP dashboard. Manage guest lists, track meal preferences, and export data.",
    color: "from-slate-500 to-slate-600",
    details: [
      "Real-time response notifications",
      "Guest list management",
      "Meal and dietary tracking",
      "Export to spreadsheet",
    ],
  },
];

const useCases = [
  {
    title: "Wedding Invitations",
    description: "Create elegant invitations that match your wedding style and theme. Manage RSVPs for multiple events like rehearsal dinners and receptions.",
    image: "/images/use-cases/wedding.jpg",
  },
  {
    title: "Birthday Parties",
    description: "Design fun, festive invitations for kids or adults. Track who's coming and collect party preferences.",
    image: "/images/use-cases/birthday.jpg",
  },
  {
    title: "Baby Showers",
    description: "Sweet, customizable designs to celebrate the upcoming arrival. Easy registry links and gift tracking.",
    image: "/images/use-cases/baby-shower.jpg",
  },
  {
    title: "Corporate Events",
    description: "Professional invitations for conferences, meetings, and company celebrations. Brand-consistent designs.",
    image: "/images/use-cases/corporate.jpg",
  },
];

const faqs = [
  {
    question: "How long does it take to create an invitation?",
    answer: "Most users create their first invitation in under 5 minutes! With AI generation, you can have a beautiful design in seconds.",
  },
  {
    question: "Do I need any design experience?",
    answer: "Not at all! Our platform is designed for everyone. The AI and templates handle the design work, and our editor is intuitive and easy to use.",
  },
  {
    question: "Can guests RSVP without creating an account?",
    answer: "Yes! Guests simply click your invitation link and can RSVP immediately without signing up for anything.",
  },
  {
    question: "How do guests receive the invitation?",
    answer: "You choose how to share - via the unique link, email, social media, messaging apps, or even print it with a QR code.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50 to-surface-50 pt-32 pb-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 mb-6">
              Create Beautiful Invitations in{" "}
              <span className="text-brand-600">4 Simple Steps</span>
            </h1>
            <p className="text-xl text-surface-600 mb-8">
              From choosing a design to tracking RSVPs, we make the entire invitation
              process effortless and enjoyable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Try It Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/templates">
                  <Eye className="w-4 h-4 mr-2" />
                  View Templates
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-surface-100 to-surface-200 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-accent-500/10" />
              <button aria-label="Watch demo video" className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Play className="w-8 h-8 text-brand-600 ml-1" />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-surface-600 font-medium">
                Watch how it works (2 min)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Your Journey to the Perfect Invitation
            </h2>
            <p className="text-surface-600">
              Follow these simple steps to create, share, and manage your invitations.
            </p>
          </div>

          <div className="space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isReversed = index % 2 === 1;
              return (
                <div
                  key={step.number}
                  className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <span className={`text-6xl font-heading font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                        {step.number}
                      </span>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-surface-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-surface-600 mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                          <span className="text-surface-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <div className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${step.color} opacity-10 flex items-center justify-center`}>
                      <Icon className="w-24 h-24 text-surface-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-700">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Design</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Let AI Do the Heavy Lifting
              </h2>
              <p className="text-brand-100 text-lg mb-8">
                Simply describe your event - the occasion, style, colors, and vibe you want.
                Our AI will generate unique, professional invitation designs tailored just for you.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-brand-100">
                    <strong className="text-white">Natural language input</strong> - describe your event in your own words
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-brand-100">
                    <strong className="text-white">Multiple variations</strong> - get several options to choose from
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-brand-100">
                    <strong className="text-white">Fully editable</strong> - AI-generated designs are completely customizable
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/auth/signup">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Try AI Generation
                  </Link>
                </Button>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <p className="text-white/60 text-sm">Example prompt:</p>
                <p className="text-white text-lg italic">
                  &ldquo;Create a modern wedding invitation for Sarah and Michael&apos;s June garden wedding.
                  Use soft pastels with greenery accents. The vibe should be romantic but not too formal.&rdquo;
                </p>
                <div className="border-t border-white/20 pt-4 mt-4">
                  <p className="text-white/60 text-sm mb-2">AI generates:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-[5/7] bg-white/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Perfect for Every Occasion
            </h2>
            <p className="text-surface-600">
              Whether it&apos;s a wedding, birthday, or corporate event, InviteGenerator has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="bg-white rounded-xl overflow-hidden border border-surface-200 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-brand-400" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-semibold text-surface-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-surface-600">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="bg-surface-50 rounded-xl p-6"
              >
                <h3 className="font-heading font-semibold text-surface-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-surface-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="text-brand-600 hover:text-brand-700 font-medium">
              View all FAQs <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
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
            Join thousands of happy users who create beautiful invitations with InviteGenerator.
            It&apos;s free to start!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-surface-600 text-white hover:bg-surface-800">
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
