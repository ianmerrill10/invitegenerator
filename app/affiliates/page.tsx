import { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Users,
  Gift,
  Clock,
  Award,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Affiliate Program - Earn up to 50% Recurring Commission | InviteGenerator",
  description: "Join the InviteGenerator Partner Program and earn up to 50% recurring commission for every customer you refer. High payouts, 90-day cookies, and dedicated support.",
  alternates: {
    canonical: "/affiliates",
  },
  openGraph: {
    title: "Earn 30-50% Recurring Commissions | InviteGenerator Affiliate Program",
    description: "Partner with InviteGenerator and earn generous recurring commissions. Join our affiliate program today.",
  },
};

const commissionTiers = [
  {
    name: "Bronze Partner",
    tier: "bronze",
    commission: "30%",
    minReferrals: 0,
    recurring: "12 months",
    color: "from-pink-200 to-pink-300",
    borderColor: "border-pink-400",
    benefits: [
      "$25 signup bonus after first conversion",
      "90-day cookie duration",
      "Weekly payouts",
      "Personal affiliate link",
    ],
  },
  {
    name: "Silver Partner",
    tier: "silver",
    commission: "35%",
    minReferrals: 10,
    recurring: "12 months",
    color: "from-gray-200 to-gray-300",
    borderColor: "border-gray-400",
    benefits: [
      "Everything in Bronze",
      "$100 milestone bonus at 10 referrals",
      "Priority support",
      "Custom promo codes",
    ],
  },
  {
    name: "Gold Partner",
    tier: "gold",
    commission: "40%",
    minReferrals: 25,
    recurring: "18 months",
    color: "from-yellow-200 to-yellow-400",
    borderColor: "border-yellow-500",
    popular: true,
    benefits: [
      "Everything in Silver",
      "$250 milestone bonus at 25 referrals",
      "Extended 18-month recurring",
      "Early access to features",
    ],
  },
  {
    name: "Platinum Partner",
    tier: "platinum",
    commission: "45%",
    minReferrals: 50,
    recurring: "24 months",
    color: "from-purple-200 to-purple-300",
    borderColor: "border-purple-400",
    benefits: [
      "Everything in Gold",
      "$500 milestone bonus at 50 referrals",
      "$1,000 quarterly bonus (top 3)",
      "Extended 24-month recurring",
    ],
  },
  {
    name: "Diamond Partner",
    tier: "diamond",
    commission: "50%",
    minReferrals: 100,
    recurring: "36 months",
    color: "from-cyan-200 to-cyan-300",
    borderColor: "border-cyan-400",
    benefits: [
      "Everything in Platinum",
      "$1,000 milestone bonus at 100 referrals",
      "$2,500 quarterly bonus (#1 performer)",
      "36-month recurring commission",
    ],
  },
];

const features = [
  {
    icon: DollarSign,
    title: "Industry-Leading Commissions",
    description: "Earn 30-50% on every sale - significantly higher than the industry average of 15-25%.",
  },
  {
    icon: TrendingUp,
    title: "Recurring Revenue",
    description: "Earn commissions for up to 36 months on every subscription renewal - not just the first sale.",
  },
  {
    icon: Clock,
    title: "90-Day Cookie Duration",
    description: "Extended tracking ensures you get credit even if customers take time to decide.",
  },
  {
    icon: CreditCard,
    title: "$50 Low Payout Threshold",
    description: "Get paid faster with our low minimum payout via PayPal, Stripe, or bank transfer.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track clicks, conversions, and earnings in real-time with our intuitive dashboard.",
  },
  {
    icon: Shield,
    title: "Trusted Brand",
    description: "Promote a high-quality product that customers love with excellent retention rates.",
  },
];

const perfectFor = [
  "Wedding & Event Bloggers",
  "Party Planning Influencers",
  "Design & DIY Content Creators",
  "Email Marketing Specialists",
  "Small Business Consultants",
  "Social Media Marketers",
  "YouTube Creators",
  "Podcast Hosts",
];

const faqs = [
  {
    question: "How does the affiliate program work?",
    answer: "Sign up for free, get your unique referral link, and share it with your audience. When someone clicks your link and purchases a subscription, you earn a commission. It's that simple!",
  },
  {
    question: "When do I get paid?",
    answer: "We process payouts weekly for balances over $50. Payments are made via PayPal, Stripe Connect, or bank transfer - your choice.",
  },
  {
    question: "How long do I earn recurring commissions?",
    answer: "Depending on your tier, you earn recurring commissions for 12-36 months on each customer you refer. As long as they remain subscribed, you keep earning!",
  },
  {
    question: "Is there an approval process?",
    answer: "For existing InviteGenerator users, approval is instant. For new users, we review applications within 24-48 hours to ensure quality partnerships.",
  },
  {
    question: "Can I use paid advertising?",
    answer: "Yes! You can use paid ads on social media, Google Ads, and more. However, bidding on our brand terms is not allowed.",
  },
  {
    question: "What promotional materials do you provide?",
    answer: "We provide banners, email templates, social media assets, landing page copy, and video scripts. Plus, we can create custom materials for top performers.",
  },
];

export default function AffiliateProgramPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-accent-500/5 to-surface-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-200/30 via-transparent to-transparent" />

        <div className="relative container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Earn Up To 50% Recurring Commission
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 mb-6">
              Partner With InviteGenerator & <span className="text-brand-500">Earn More</span>
            </h1>

            <p className="text-xl text-surface-600 mb-8 max-w-2xl mx-auto">
              Join our affiliate program and earn industry-leading commissions promoting a product your audience will love. No experience required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/affiliates/join">
                <Button size="lg" className="text-lg px-8">
                  Join Now - It&apos;s Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/affiliates/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Existing Partner? Log In
                </Button>
              </Link>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-brand-500">$500k+</p>
                <p className="text-surface-600 text-sm">Paid to Affiliates</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-brand-500">2,500+</p>
                <p className="text-surface-600 text-sm">Active Partners</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-brand-500">50%</p>
                <p className="text-surface-600 text-sm">Max Commission</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Why Partner With Us?
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              We offer one of the most generous affiliate programs in the SaaS industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-surface-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex p-3 rounded-xl bg-brand-100 mb-4">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-surface-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-surface-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-20 bg-surface-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Grow Your Earnings With Tiers
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              The more you refer, the more you earn. Unlock higher commission rates as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {commissionTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`relative bg-white rounded-2xl border-2 ${tier.borderColor} p-6 ${
                  tier.popular ? "ring-4 ring-yellow-200" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className={`bg-gradient-to-br ${tier.color} rounded-xl p-4 mb-4 text-center`}>
                  <p className="text-sm text-surface-700 font-medium">{tier.name}</p>
                  <p className="text-4xl font-bold text-surface-900">{tier.commission}</p>
                  <p className="text-xs text-surface-600">recurring for {tier.recurring}</p>
                </div>

                <p className="text-sm text-surface-600 mb-4">
                  {tier.minReferrals === 0
                    ? "Start here"
                    : `Unlock at ${tier.minReferrals} referrals`}
                </p>

                <ul className="space-y-2">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-surface-700">
                      <Check className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-6">
                Perfect For Content Creators & Marketers
              </h2>
              <p className="text-lg text-surface-600 mb-8">
                If you have an audience interested in events, weddings, parties, or design, our affiliate program is perfect for you. Our affiliates typically earn $500-$5,000+ per month.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {perfectFor.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-slate-500" />
                    <span className="text-surface-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl p-8 text-white">
              <h3 className="font-heading text-2xl font-bold mb-6">Quick Math</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span>Average sale value</span>
                  <span className="font-bold">$24/month</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span>Your commission (30%)</span>
                  <span className="font-bold">$7.20/month</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span>Per referral annually</span>
                  <span className="font-bold">$86.40</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span>10 referrals/month</span>
                  <span className="font-bold text-lg">$864/year each</span>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-sm opacity-90 mb-1">Potential Monthly Earnings</p>
                  <p className="text-4xl font-bold">$720+</p>
                  <p className="text-sm opacity-75">with just 10 referrals/month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-surface-300 max-w-2xl mx-auto">
              Getting started takes just 2 minutes. No technical skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up Free",
                description: "Create your affiliate account in seconds. Instant approval for existing users.",
              },
              {
                step: "2",
                title: "Get Your Link",
                description: "Receive your unique referral link and tracking code immediately.",
              },
              {
                step: "3",
                title: "Share & Promote",
                description: "Share on social media, blogs, email, or anywhere your audience is.",
              },
              {
                step: "4",
                title: "Earn Commissions",
                description: "Get paid weekly via PayPal, Stripe, or bank transfer.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500 text-white text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-surface-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-surface-50 rounded-xl p-6"
              >
                <h3 className="font-heading text-lg font-bold text-surface-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-surface-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-500 to-accent-500">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of partners earning passive income with InviteGenerator. Start for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/affiliates/join">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-600 text-lg px-8">
                Join the Partner Program
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-white/70 text-sm mt-4">
            No credit card required. Free to join.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
