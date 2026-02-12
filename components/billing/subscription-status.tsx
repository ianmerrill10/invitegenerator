"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export interface Subscription {
  id: string;
  planName: string;
  planId: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "expired";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date;
}

export interface UsageData {
  invitations: { used: number; limit: number };
  guests: { used: number; limit: number };
  storage: { used: number; limit: number; unit: string };
  emailsSent?: { used: number; limit: number };
}

interface SubscriptionStatusProps {
  subscription: Subscription | null;
  usage?: UsageData;
  onManage?: () => void;
  onUpgrade?: () => void;
  className?: string;
}

const statusConfig = {
  active: { label: "Active", variant: "success" as const, icon: CheckCircle },
  trialing: { label: "Trial", variant: "warning" as const, icon: Zap },
  past_due: { label: "Past Due", variant: "error" as const, icon: AlertCircle },
  canceled: { label: "Canceled", variant: "secondary" as const, icon: AlertCircle },
  expired: { label: "Expired", variant: "error" as const, icon: AlertCircle },
};

export function SubscriptionStatus({
  subscription,
  usage,
  onManage,
  onUpgrade,
  className,
}: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-900 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No Active Subscription</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to unlock premium features
          </p>
          {onUpgrade && (
            <Button onClick={onUpgrade}>
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const config = statusConfig[subscription.status];
  const StatusIcon = config.icon;
  const daysRemaining = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Subscription</CardTitle>
          <Badge variant={config.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Plan Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{subscription.planName}</p>
            {subscription.trialEnd && subscription.status === "trialing" && (
              <p className="text-sm text-muted-foreground">
                Trial ends {formatDistanceToNow(subscription.trialEnd, { addSuffix: true })}
              </p>
            )}
          </div>
          {onManage && (
            <Button variant="outline" size="sm" onClick={onManage}>
              Manage
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Billing Period */}
        <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-900 rounded-lg">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"}{" "}
              {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysRemaining} days remaining
            </p>
          </div>
        </div>

        {/* Usage Stats */}
        {usage && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Usage this period</p>
            <UsageBar
              label="Invitations"
              used={usage.invitations.used}
              limit={usage.invitations.limit}
            />
            <UsageBar
              label="Guests"
              used={usage.guests.used}
              limit={usage.guests.limit}
            />
            <UsageBar
              label={`Storage (${usage.storage.unit})`}
              used={usage.storage.used}
              limit={usage.storage.limit}
            />
            {usage.emailsSent && (
              <UsageBar
                label="Emails"
                used={usage.emailsSent.used}
                limit={usage.emailsSent.limit}
              />
            )}
          </div>
        )}

        {/* Warnings */}
        {subscription.status === "past_due" && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Payment failed. Please update your payment method.</span>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && (
          <div className="p-3 bg-warning/10 text-warning rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Your subscription will end on{" "}
              {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Usage bar component
interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
}

function UsageBar({ label, used, limit }: UsageBarProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(isAtLimit && "text-destructive font-medium")}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-1.5",
          isAtLimit
            ? "[&>div]:bg-destructive"
            : isNearLimit
            ? "[&>div]:bg-warning"
            : ""
        )}
      />
    </div>
  );
}

// Compact subscription badge
interface SubscriptionBadgeProps {
  planName: string;
  status: Subscription["status"];
  className?: string;
}

export function SubscriptionBadge({
  planName,
  status,
  className,
}: SubscriptionBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      {planName}
    </Badge>
  );
}
