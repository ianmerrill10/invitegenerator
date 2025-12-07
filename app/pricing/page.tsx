"use client";

/**
 * Public Pricing Page
 *
 * Displays subscription plans with features comparison.
 * Invitations are FREE - monetization through affiliate products.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap, Crown, Building } from "lucide-react";
import { PRICING_PLANS } from "@/lib/constants";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const planIcons = {
    free: Sparkles,
    starter: Zap,
    pro: Crown,
    business: Building,
  };

  const planColors = {
    free: "bg-surface-100 border-surface-200",
    starter: "bg-accent-50 border-accent-200",
    pro: "bg-brand-50 border-brand-200",
    business: "bg-purple-50 border-purple-200",
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="brand" className="mb-4">
              Simple Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-4">
              Create Beautiful Invitations
              <span className="text-brand-500"> for Free</span>
            </h1>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto mb-8">
              Start creating stunning AI-powered invitations today. Upgrade for more
              features and unlimited creativity.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 shadow-sm border border-surface-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-brand-500 text-white"
                    : "text-surface-600 hover:text-surface-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === "yearly"
                    ? "bg-brand-500 text-white"
                    : "text-surface-600 hover:text-surface-900"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs text-success-600 font-semibold">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan, index) => {
              const Icon = planIcons[plan.plan as keyof typeof planIcons];
              const colorClass = planColors[plan.plan as keyof typeof planColors];
              const price = billingCycle === "yearly" ? plan.priceYearly / 12 : plan.price;
              const isPopular = plan.plan === "pro";

              return (
                <motion.div
                  key={plan.plan}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`relative p-6 h-full flex flex-col ${colorClass} ${
                      isPopular ? "ring-2 ring-brand-500" : ""
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="brand">Most Popular</Badge>
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isPopular ? "bg-brand-100" : "bg-surface-100"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isPopular ? "text-brand-600" : "text-surface-600"
                            }`}
                          />
                        </div>
                        <h3 className="text-xl font-semibold text-surface-900">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-surface-900">
                          ${price.toFixed(0)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-surface-500">/month</span>
                        )}
                      </div>
                      {billingCycle === "yearly" && plan.price > 0 && (
                        <p className="text-sm text-success-600 mt-1">
                          ${plan.priceYearly} billed annually
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-surface-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.price === 0 ? "/auth/signup" : "/auth/signup"}>
                      <Button
                        variant={isPopular ? "primary" : "outline"}
                        className="w-full"
                      >
                        {plan.price === 0 ? "Get Started Free" : "Start Free Trial"}
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-display font-bold text-center text-surface-900 mb-12">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-4 px-4 font-medium text-surface-600">
                    Feature
                  </th>
                  {PRICING_PLANS.map((plan) => (
                    <th
                      key={plan.plan}
                      className="text-center py-4 px-4 font-medium text-surface-900"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <FeatureRow
                  feature="Invitations per month"
                  values={PRICING_PLANS.map((p) =>
                    p.invitationsPerMonth === -1 ? "Unlimited" : p.invitationsPerMonth.toString()
                  )}
                />
                <FeatureRow
                  feature="AI generations"
                  values={PRICING_PLANS.map((p) =>
                    p.aiCreditsPerMonth === -1 ? "Unlimited" : p.aiCreditsPerMonth.toString()
                  )}
                />
                <FeatureRow
                  feature="Guests per invitation"
                  values={PRICING_PLANS.map((p) =>
                    p.guestsPerInvitation === -1 ? "Unlimited" : p.guestsPerInvitation.toString()
                  )}
                />
                <FeatureRow
                  feature="Premium templates"
                  values={PRICING_PLANS.map((p) => p.premiumTemplates)}
                  isBoolean
                />
                <FeatureRow
                  feature="Custom branding"
                  values={PRICING_PLANS.map((p) => p.customBranding)}
                  isBoolean
                />
                <FeatureRow
                  feature="Analytics"
                  values={PRICING_PLANS.map((p) => p.analytics)}
                  isBoolean
                />
                <FeatureRow
                  feature="Priority support"
                  values={PRICING_PLANS.map((p) => p.prioritySupport)}
                  isBoolean
                />
                <FeatureRow
                  feature="API access"
                  values={PRICING_PLANS.map((p) => p.apiAccess)}
                  isBoolean
                />
                <FeatureRow
                  feature="Team members"
                  values={PRICING_PLANS.map((p) =>
                    p.teamMembers === -1 ? "Unlimited" : p.teamMembers.toString()
                  )}
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center text-surface-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FAQItem
              question="Is InviteGenerator really free?"
              answer="Yes! You can create up to 3 beautiful invitations per month completely free. We offer premium plans for power users who need more features and unlimited invitations."
            />
            <FAQItem
              question="Can I upgrade or downgrade anytime?"
              answer="Absolutely! You can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your billing cycle."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are securely processed through Stripe."
            />
            <FAQItem
              question="Is there a free trial for paid plans?"
              answer="Yes! All paid plans come with a 14-day free trial. No credit card required to start."
            />
            <FAQItem
              question="What happens to my invitations if I cancel?"
              answer="Your existing invitations will remain active and accessible. You'll just be limited to the free plan features for new invitations."
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureRow({
  feature,
  values,
  isBoolean = false,
}: {
  feature: string;
  values: (string | boolean)[];
  isBoolean?: boolean;
}) {
  return (
    <tr className="border-b border-surface-100">
      <td className="py-4 px-4 text-surface-700">{feature}</td>
      {values.map((value, i) => (
        <td key={i} className="text-center py-4 px-4">
          {isBoolean ? (
            value ? (
              <Check className="h-5 w-5 text-success-500 mx-auto" />
            ) : (
              <X className="h-5 w-5 text-surface-300 mx-auto" />
            )
          ) : (
            <span className="text-surface-900 font-medium">{value}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-surface-200">
      <h3 className="font-semibold text-surface-900 mb-2">{question}</h3>
      <p className="text-surface-600">{answer}</p>
    </div>
  );
}
