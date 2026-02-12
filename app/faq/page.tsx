"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, HelpCircle, Mail, MessageCircle } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqCategories = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: "🚀",
    faqs: [
      {
        question: "How do I create my first invitation?",
        answer: "Creating your first invitation is easy! Simply sign up for a free account, click 'Create New Invitation' from your dashboard, choose a template or start from scratch, customize your design, add your event details, and publish. Our AI can also help generate unique designs based on your event type and preferences.",
      },
      {
        question: "Is InviteGenerator free to use?",
        answer: "Yes! We offer a generous free plan that includes 3 invitations per month, 5 AI generations, and up to 50 guests per invitation. For more features and higher limits, check out our Starter, Pro, and Business plans.",
      },
      {
        question: "Do I need design experience to use InviteGenerator?",
        answer: "Not at all! Our platform is designed for everyone, regardless of design experience. With our AI-powered generation and beautiful templates, you can create stunning invitations in minutes. Just provide your event details and let our tools do the heavy lifting.",
      },
      {
        question: "Can I try premium features before subscribing?",
        answer: "Yes! When you sign up, you can preview all premium templates and features. While you'll need a paid plan to publish invitations with premium features, you can explore everything the platform offers before committing.",
      },
    ],
  },
  {
    id: "creating-invitations",
    name: "Creating Invitations",
    icon: "✉️",
    faqs: [
      {
        question: "What types of events can I create invitations for?",
        answer: "InviteGenerator supports all types of events including weddings, birthdays, baby showers, bridal showers, anniversaries, graduations, corporate events, holiday parties, dinner parties, and more. We have templates and AI capabilities optimized for each event type.",
      },
      {
        question: "How does the AI invitation generator work?",
        answer: "Our AI uses advanced language models to understand your event details, preferences, and style choices. Simply describe your event, select your preferred aesthetic (modern, classic, playful, etc.), and the AI will generate unique invitation designs and wording tailored to your needs.",
      },
      {
        question: "Can I upload my own images and backgrounds?",
        answer: "Absolutely! You can upload your own photos, logos, and backgrounds to personalize your invitations. We support JPG, PNG, and SVG formats. Pro and Business plans include advanced image editing tools like background removal.",
      },
      {
        question: "What sizes are available for invitations?",
        answer: "We offer multiple size options including Standard (5:7), Square (1:1), Wide (3:2), Instagram (1:1), Story (9:16), and A5 (1:1.41). You can also export in various resolutions for print or digital use.",
      },
    ],
  },
  {
    id: "rsvp-management",
    name: "RSVP Management",
    icon: "📋",
    faqs: [
      {
        question: "How does RSVP tracking work?",
        answer: "When you publish an invitation, you'll get a unique shareable link. Guests can RSVP directly through this link, and all responses are automatically collected in your dashboard. You can track attendance, meal preferences, dietary restrictions, and custom questions.",
      },
      {
        question: "Can I set an RSVP deadline?",
        answer: "Yes! You can set a custom RSVP deadline for each invitation. Guests will see the deadline on the invitation page, and you can choose to accept or block late responses.",
      },
      {
        question: "Can I export my RSVP list?",
        answer: "Absolutely! You can export your guest list and RSVP responses to CSV or Excel format. This is great for creating seating charts, coordinating with caterers, or keeping offline records.",
      },
      {
        question: "Can guests update their RSVP after submitting?",
        answer: "Yes, guests can update their RSVP until the deadline you set. They'll use the same link and email address to access and modify their response.",
      },
    ],
  },
  {
    id: "sharing-publishing",
    name: "Sharing & Publishing",
    icon: "🔗",
    faqs: [
      {
        question: "How do I share my invitation?",
        answer: "Once published, you'll get a unique short link (like invitegenerator.com/i/abc123) that you can share via email, text, social media, or messaging apps. We also provide QR codes for easy scanning at in-person events.",
      },
      {
        question: "Can I customize my invitation URL?",
        answer: "Pro and Business plans allow custom URLs for your invitations. You can create memorable links like invitegenerator.com/i/sarah-wedding or even use your own custom domain with our Business plan.",
      },
      {
        question: "Can I download my invitation as an image or PDF?",
        answer: "Yes! Pro and Business plans include the ability to export your invitations as high-resolution PNG images or print-ready PDFs. This is perfect for printing physical copies or sharing as attachments.",
      },
      {
        question: "Is there a limit to how many people can view my invitation?",
        answer: "No! Once published, your invitation can be viewed unlimited times. The guest limits in our plans refer to RSVP capacity, not views.",
      },
    ],
  },
  {
    id: "account-billing",
    name: "Account & Billing",
    icon: "💳",
    faqs: [
      {
        question: "How do I upgrade my plan?",
        answer: "You can upgrade anytime from your account settings. Go to Settings > Subscription and choose your new plan. Upgrades take effect immediately, and you'll be credited for any unused time on your current plan.",
      },
      {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel anytime. Your subscription will remain active until the end of your current billing period. After cancellation, you'll still have access to your created invitations on the free plan.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. Business plans can also pay via invoice.",
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team within 14 days of your purchase for a full refund.",
      },
    ],
  },
  {
    id: "technical",
    name: "Technical Questions",
    icon: "⚙️",
    faqs: [
      {
        question: "What browsers are supported?",
        answer: "InviteGenerator works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser for the best experience.",
      },
      {
        question: "Can I use InviteGenerator on mobile devices?",
        answer: "Yes! Our platform is fully responsive and works great on smartphones and tablets. You can create, edit, and manage invitations from any device.",
      },
      {
        question: "Is my data secure?",
        answer: "Absolutely. We use industry-standard encryption (SSL/TLS) for all data transmission. Your data is stored securely on AWS infrastructure with regular backups. We never sell or share your personal information.",
      },
      {
        question: "Do you have an API?",
        answer: "Yes! Our Business plan includes API access for integrating InviteGenerator into your own applications or workflows. Check out our API documentation for details.",
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) =>
    activeCategory ? category.id === activeCategory : category.faqs.length > 0
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50 to-surface-50 pt-32 pb-16">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-surface-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-surface-600 mb-8">
              Find answers to common questions about InviteGenerator. Can&apos;t find what you&apos;re looking for? Contact our support team.
            </p>

            {/* Search Box */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-surface-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-8 border-b border-surface-200 bg-white sticky top-0 z-10">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                !activeCategory
                  ? "bg-brand-500 text-white"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              )}
            >
              All Categories
            </button>
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  activeCategory === category.id
                    ? "bg-brand-500 text-white"
                    : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                )}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container-custom max-w-4xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-surface-600 mb-4">No results found for &ldquo;{searchQuery}&rdquo;</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <h2 className="font-heading text-xl font-semibold text-surface-900 mb-6 flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.name}
                  </h2>
                  <div className="space-y-4">
                    {category.faqs.map((faq, index) => {
                      const itemId = `${category.id}-${index}`;
                      const isOpen = openItems[itemId];
                      return (
                        <div
                          key={itemId}
                          className="bg-white rounded-xl border border-surface-200 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface-50 transition-colors"
                          >
                            <span className="font-medium text-surface-900 pr-4">
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-5 h-5 text-surface-400 flex-shrink-0 transition-transform",
                                isOpen && "rotate-180"
                              )}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <p className="text-surface-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-surface-900 mb-4">
                  Still Have Questions?
                </h2>
                <p className="text-surface-600">
                  Our support team is here to help. Reach out and we&apos;ll get back to you as soon as possible.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  href="/contact"
                  className="flex items-center gap-4 p-6 bg-white rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900">Email Support</h3>
                    <p className="text-sm text-surface-600">Get help via email</p>
                  </div>
                </Link>
                <Link
                  href="/help"
                  className="flex items-center gap-4 p-6 bg-white rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900">Help Center</h3>
                    <p className="text-sm text-surface-600">Browse detailed guides</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
