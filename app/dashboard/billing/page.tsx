"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout";
import {
  PricingSection,
  SubscriptionStatus,
  type PricingTier,
  type Subscription,
  type UsageData,
} from "@/components/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Receipt, ExternalLink, Shield, Loader2 } from "lucide-react";

// Pricing tiers configuration
const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    features: [
      { text: "3 invitations", included: true },
      { text: "50 guests per event", included: true },
      { text: "Basic templates", included: true },
      { text: "Email notifications", included: true },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Current Plan",
  },
  {
    id: "starter",
    name: "Starter",
    description: "Great for personal events",
    price: 9,
    priceYearly: 86,
    features: [
      { text: "10 invitations", included: true },
      { text: "200 guests per event", included: true },
      { text: "All templates", included: true },
      { text: "Email notifications", included: true },
      { text: "Custom branding", included: true, highlight: true },
      { text: "Priority support", included: false },
    ],
    cta: "Upgrade",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For event planners & businesses",
    price: 29,
    priceYearly: 278,
    popular: true,
    features: [
      { text: "Unlimited invitations", included: true, highlight: true },
      { text: "1,000 guests per event", included: true },
      { text: "All templates + custom", included: true },
      { text: "Email & SMS notifications", included: true },
      { text: "Advanced analytics", included: true, highlight: true },
      { text: "Priority support", included: true },
    ],
    cta: "Upgrade",
  },
  {
    id: "business",
    name: "Business",
    description: "For large organizations",
    price: 79,
    priceYearly: 758,
    features: [
      { text: "Unlimited everything", included: true, highlight: true },
      { text: "Unlimited guests", included: true },
      { text: "White-label solution", included: true, highlight: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated support", included: true, highlight: true },
    ],
    cta: "Contact Sales",
  },
];

// Mock subscription data (replace with actual API call)
const mockSubscription: Subscription = {
  id: "sub_123",
  planName: "Free",
  planId: "free",
  status: "active",
  currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
};

// Mock usage data
const mockUsage: UsageData = {
  invitations: { used: 2, limit: 3 },
  guests: { used: 45, limit: 50 },
  storage: { used: 25, limit: 100, unit: "MB" },
  emailsSent: { used: 120, limit: 500 },
};

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription] = useState<Subscription | null>(mockSubscription);
  const [usage] = useState<UsageData>(mockUsage);

  const handleSelectPlan = async (tierId: string) => {
    if (tierId === "business") {
      // Open contact form or email
      window.open("mailto:sales@invitegen.com?subject=Business Plan Inquiry", "_blank");
      return;
    }

    if (tierId === subscription?.planId) {
      toast.info("You're already on this plan");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: tierId }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to open billing portal");

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    // Scroll to pricing section
    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription, view usage, and update payment methods"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Billing" },
        ]}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* Current Subscription & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionStatus
          subscription={subscription}
          usage={usage}
          onManage={handleManageSubscription}
          onUpgrade={handleUpgrade}
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing Actions</CardTitle>
            <CardDescription>Manage your payment and billing settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleManageSubscription}
            >
              <CreditCard className="h-4 w-4 mr-3" />
              Update Payment Method
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleManageSubscription}
            >
              <Receipt className="h-4 w-4 mr-3" />
              View Billing History
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/settings?tab=billing")}
            >
              <Shield className="h-4 w-4 mr-3" />
              Billing Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Pricing Section */}
      <div id="pricing-section" className="scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">
            Select the perfect plan for your event needs
          </p>
        </div>

        <PricingSection
          tiers={pricingTiers}
          onSelect={handleSelectPlan}
          currentPlanId={subscription?.planId}
          loading={isLoading}
        />
      </div>

      {/* FAQ Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment partner Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Can I upgrade or downgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Absolutely! You can change your plan at any time. Changes take effect immediately, and we'll prorate your billing.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Is there a free trial?</h4>
            <p className="text-sm text-muted-foreground">
              Our Free plan lets you try InviteGen at no cost. Upgrade whenever you need more features or capacity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
