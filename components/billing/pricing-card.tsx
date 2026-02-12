"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";

interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  priceYearly?: number;
  currency?: string;
  interval?: "month" | "year" | "one-time";
  features: PricingFeature[];
  popular?: boolean;
  cta?: string;
  badge?: string;
}

interface PricingCardProps {
  tier: PricingTier;
  billingInterval?: "monthly" | "yearly";
  onSelect?: (tierId: string) => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
  className?: string;
}

export function PricingCard({
  tier,
  billingInterval = "monthly",
  onSelect,
  isCurrentPlan = false,
  loading = false,
  className,
}: PricingCardProps) {
  const price = billingInterval === "yearly" && tier.priceYearly
    ? tier.priceYearly
    : tier.price;
  const currency = tier.currency || "$";
  const interval = tier.interval === "one-time" ? "" : `/${billingInterval === "yearly" ? "year" : "mo"}`;

  const savings = tier.priceYearly && tier.price > 0
    ? Math.round(((tier.price * 12 - tier.priceYearly) / (tier.price * 12)) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        tier.popular && "border-primary shadow-lg",
        isCurrentPlan && "border-success",
        className
      )}
    >
      {/* Badge */}
      {(tier.popular || tier.badge) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge
            variant={tier.popular ? "primary" : "secondary"}
            className="gap-1"
          >
            {tier.popular && <Star className="h-3 w-3" />}
            {tier.badge || "Most Popular"}
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="success">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Price */}
        <div className="text-center py-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold">{currency}</span>
            <span className="text-5xl font-bold">{price}</span>
            {interval && (
              <span className="text-muted-foreground">{interval}</span>
            )}
          </div>
          {billingInterval === "yearly" && savings > 0 && (
            <p className="text-sm text-success mt-1">
              Save {savings}% with annual billing
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 flex-1 mb-6">
          {tier.features.map((feature, index) => (
            <li
              key={index}
              className={cn(
                "flex items-start gap-3 text-sm",
                !feature.included && "text-muted-foreground"
              )}
            >
              {feature.included ? (
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0 mt-0.5",
                    feature.highlight ? "text-success" : "text-primary"
                  )}
                />
              ) : (
                <X className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/50" />
              )}
              <span className={cn(feature.highlight && "font-medium")}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          variant={tier.popular ? "primary" : "outline"}
          className="w-full"
          onClick={() => onSelect?.(tier.id)}
          disabled={loading || isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : tier.cta || "Get Started"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Pricing section with multiple tiers
interface PricingSectionProps {
  tiers: PricingTier[];
  onSelect?: (tierId: string) => void;
  currentPlanId?: string;
  loading?: boolean;
  showBillingToggle?: boolean;
  className?: string;
}

export function PricingSection({
  tiers,
  onSelect,
  currentPlanId,
  loading = false,
  showBillingToggle = true,
  className,
}: PricingSectionProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className={cn("space-y-8", className)}>
      {/* Billing Toggle */}
      {showBillingToggle && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            onClick={() => setBillingInterval("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            title="Toggle billing interval"
            aria-label={`Switch to ${billingInterval === "monthly" ? "yearly" : "monthly"} billing`}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors",
              billingInterval === "yearly" ? "bg-primary" : "bg-surface-200"
            )}
            onClick={() =>
              setBillingInterval(
                billingInterval === "monthly" ? "yearly" : "monthly"
              )
            }
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                billingInterval === "yearly" ? "translate-x-7" : "translate-x-1"
              )}
            />
          </button>
          <button
            type="button"
            className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === "yearly"
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            onClick={() => setBillingInterval("yearly")}
          >
            Yearly
            <Badge variant="success" className="ml-2">
              Save 20%
            </Badge>
          </button>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            billingInterval={billingInterval}
            onSelect={onSelect}
            isCurrentPlan={currentPlanId === tier.id}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
