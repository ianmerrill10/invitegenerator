import { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Zap, Building, Crown } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { FAQSchema, ProductSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Pricing - Simple, Transparent Plans",
  description: "Choose the perfect plan for your invitation needs. Start free, upgrade anytime. No hidden fees.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "InviteGenerator Pricing - Plans for Every Occasion",
    description: "Create stunning invitations starting from free. Upgrade for more features and unlimited access.",
  },
};

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out InviteGenerator",
    price: "0",
    priceLabel: "Free forever",
    icon: Sparkles,
    features: [
      "3 invitations per month",
      "5 AI generation credits",
      "Basic templates",
      "RSVP tracking (50 guests)",
      "Email sharing",
      "Standard support",
    ],
    cta: "Get Started",
    ctaLink: "/auth/signup",
    popular: false,
  },
  {
    name: "Starter",
    description: "Great for personal events",
    price: "9",
    priceLabel: "/month",
    icon: Zap,
    features: [
      "10 invitations per month",
      "25 AI generation credits",
      "Premium templates",
      "RSVP tracking (200 guests)",
      "Email & social sharing",
      "Priority support",
      "Remove watermarks",
      "Custom QR codes",
    ],
    cta: "Start Free Trial",
    ctaLink: "/auth/signup?plan=starter",
    popular: true,
  },
  {
    name: "Pro",
    description: "For event planners & professionals",
    price: "24",
    priceLabel: "/month",
    icon: Crown,
    features: [
      "Unlimited invitations",
      "100 AI generation credits",
      "All premium templates",
      "Unlimited RSVP tracking",
      "Custom branding",
      "Advanced analytics",
      "Export to PDF/PNG",
      "Priority support",
      "Team collaboration (3 members)",
    ],
    cta: "Start Free Trial",
    ctaLink: "/auth/signup?plan=pro",
    popular: false,
  },
  {
    name: "Business",
    description: "For agencies & enterprises",
    price: "79",
    priceLabel: "/month",
    icon: Building,
    features: [
      "Everything in Pro",
      "Unlimited AI credits",
      "API access",
      "White-label options",
      "Custom templates",
      "Dedicated account manager",
      "SSO/SAML authentication",
      "Unlimited team members",
      "99.9% uptime SLA",
    ],
    cta: "Contact Sales",
    ctaLink: "/contact?plan=business",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I try InviteGenerator for free?",
    answer: "Yes! Our Free plan lets you create up to 3 invitations per month with basic features. No credit card required to get started.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and PayPal through our secure payment processor, Stripe.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "What happens to my invitations if I downgrade?",
    answer: "Your existing invitations remain active. However, you won't be able to create new invitations beyond your plan's limit until you upgrade again.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 7-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team for a full refund.",
  },
  {
    question: "What are AI generation credits?",
    answer: "AI credits are used when you generate invitation designs or content using our AI features. Each generation uses one credit. Credits reset monthly.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes! Annual plans save you 20% compared to monthly billing. That's like getting 2 months free!",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at your next billing cycle.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <FAQSchema faqs={faqs} />
      {plans.map((plan) => (
        <ProductSchema
          key={plan.name}
          name={`InviteGenerator ${plan.name} Plan`}
          description={plan.description}
          price={plan.price}
        />
      ))}

      <Header />
      <main className="min-h-screen bg-surface-50">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-surface-50" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-surface-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your needs. Start free, upgrade anytime.
              No hidden fees, no surprises.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">
              <Check className="w-4 h-4" />
              7-day money-back guarantee on all paid plans
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative bg-white rounded-2xl shadow-sm border-2 p-8 flex flex-col ${
                      plan.popular
                        ? "border-brand-500 ring-4 ring-brand-100"
                        : "border-surface-200"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center px-4 py-1 rounded-full bg-brand-500 text-white text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <div className={`inline-flex p-3 rounded-xl mb-4 ${
                        plan.popular ? "bg-brand-100" : "bg-surface-100"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          plan.popular ? "text-brand-600" : "text-surface-600"
                        }`} />
                      </div>
                      <h3 className="text-xl font-heading font-bold text-surface-900">
                        {plan.name}
                      </h3>
                      <p className="text-surface-600 text-sm mt-1">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-surface-900">
                        ${plan.price}
                      </span>
                      <span className="text-surface-600">{plan.priceLabel}</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="text-surface-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.ctaLink}>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "primary" : "outline"}
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-16 bg-surface-900">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Need a custom solution?
            </h2>
            <p className="text-surface-300 mb-8 max-w-2xl mx-auto">
              We offer custom enterprise solutions with dedicated support, custom integrations,
              and volume discounts for large organizations.
            </p>
            <Link href="/contact?plan=enterprise">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-surface-900">
                Contact Enterprise Sales
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-heading font-bold text-surface-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-surface-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-surface-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-surface-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-brand-500 to-accent-500">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Ready to create stunning invitations?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Join thousands of users creating beautiful invitations with InviteGenerator.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-600">
                Start Creating for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
