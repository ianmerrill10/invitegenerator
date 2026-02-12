"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Users,
  MousePointer,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Gift,
  CreditCard,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Affiliate,
  AffiliateTierConfig,
  Referral,
  AffiliateCommission,
  AffiliatePayout,
} from "@/types";

interface DashboardData {
  affiliate: Affiliate;
  tierConfig: AffiliateTierConfig;
  referrals: Referral[];
  commissions: AffiliateCommission[];
  payouts: AffiliatePayout[];
  affiliateLink: string;
  allTiers: AffiliateTierConfig[];
}

export default function AffiliateDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState<boolean | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/affiliates");
      const result = await response.json();

      if (result.success) {
        setIsAffiliate(result.isAffiliate);
        if (result.isAffiliate) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const requestPayout = async () => {
    try {
      const response = await fetch("/api/affiliates/payout", {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchDashboardData();
      } else {
        toast.error(result.error?.message || "Failed to request payout");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-surface-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isAffiliate === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-100 mb-6">
            <Gift className="w-10 h-10 text-brand-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-surface-900 mb-4">
            Join Our Partner Program
          </h1>
          <p className="text-surface-600 mb-8">
            You&apos;re not yet a partner. Join our affiliate program to start earning up to 50% recurring commissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/affiliates/join">
              <Button size="lg">Apply to Become a Partner</Button>
            </Link>
            <Link href="/affiliates">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-surface-600">Unable to load dashboard data. Please try again.</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { affiliate, tierConfig, referrals, commissions, payouts, affiliateLink, allTiers } = data;
  const nextTier = allTiers.find((t) => t.minReferrals > affiliate.stats.totalConversions);
  const progressToNextTier = nextTier
    ? ((affiliate.stats.totalConversions - (tierConfig?.minReferrals || 0)) /
        (nextTier.minReferrals - (tierConfig?.minReferrals || 0))) *
      100
    : 100;

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-heading text-xl font-bold text-brand-500">
                InviteGenerator
              </Link>
              <span className="text-surface-400">|</span>
              <span className="text-surface-600 font-medium">Partner Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Main Dashboard
                </Button>
              </Link>
              <Link href="/affiliates/resources">
                <Button variant="outline" size="sm">
                  Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90 uppercase tracking-wide">
                  {tierConfig?.name || "Bronze Partner"}
                </span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
                Welcome back, Partner!
              </h1>
              <p className="opacity-90">
                Your referral code: <span className="font-mono font-bold">{affiliate.code}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand-600"
                onClick={() => copyToClipboard(affiliateLink)}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Affiliate Link
              </Button>
              {affiliate.stats.pendingEarnings >= 50 && (
                <Button
                  onClick={requestPayout}
                  className="bg-white text-brand-600 hover:bg-white/90"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <MousePointer className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-surface-600">Total Clicks</span>
            </div>
            <p className="text-3xl font-bold text-surface-900">
              {affiliate.stats.totalClicks.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-surface-600">Signups</span>
            </div>
            <p className="text-3xl font-bold text-surface-900">
              {affiliate.stats.totalSignups}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-sm text-surface-600">Conversions</span>
            </div>
            <p className="text-3xl font-bold text-surface-900">
              {affiliate.stats.totalConversions}
            </p>
            <p className="text-sm text-surface-500">
              {affiliate.stats.conversionRate.toFixed(1)}% rate
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm text-surface-600">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-surface-900">
              ${affiliate.stats.totalEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-green-600">
              ${affiliate.stats.pendingEarnings.toFixed(2)} pending
            </p>
          </div>
        </div>

        {/* Tier Progress */}
        {nextTier && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-surface-900">
                  Progress to {nextTier.name}
                </h2>
                <p className="text-sm text-surface-600">
                  {nextTier.minReferrals - affiliate.stats.totalConversions} more conversions to unlock {nextTier.commissionRate}% commission
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-brand-500">
                  {affiliate.stats.totalConversions}
                </span>
                <span className="text-surface-400">/{nextTier.minReferrals}</span>
              </div>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-brand-500 to-accent-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Affiliate Link Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="font-heading text-lg font-bold text-surface-900 mb-4">
            Your Affiliate Link
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 bg-surface-100 rounded-lg p-3">
              <input
                type="text"
                readOnly
                value={affiliateLink}
                className="flex-1 bg-transparent text-surface-700 font-mono text-sm outline-none"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(affiliateLink)}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Referrals */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-surface-200 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-surface-900">
                Recent Referrals
              </h2>
              <Link href="/affiliates/referrals" className="text-brand-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-surface-100">
              {referrals.length === 0 ? (
                <div className="p-8 text-center text-surface-500">
                  No referrals yet. Share your link to get started!
                </div>
              ) : (
                referrals.slice(0, 5).map((referral) => (
                  <div key={referral.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900">
                        {referral.referredEmail || "Anonymous"}
                      </p>
                      <p className="text-sm text-surface-500">
                        {referral.source} • {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === "converted"
                          ? "bg-green-100 text-green-700"
                          : referral.status === "signed_up"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-surface-100 text-surface-600"
                      }`}
                    >
                      {referral.status.replace("_", " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-surface-200 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-surface-900">
                Recent Commissions
              </h2>
              <Link href="/affiliates/commissions" className="text-brand-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-surface-100">
              {commissions.length === 0 ? (
                <div className="p-8 text-center text-surface-500">
                  No commissions yet. Your first conversion is coming!
                </div>
              ) : (
                commissions.slice(0, 5).map((commission) => (
                  <div key={commission.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900">
                        ${commission.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-surface-500">
                        {commission.type.replace("_", " ")} • {new Date(commission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        commission.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : commission.status === "approved"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {commission.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Payouts Section */}
        <div className="bg-white rounded-xl shadow-sm mt-8">
          <div className="p-6 border-b border-surface-200 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-surface-900">
                Payout History
              </h2>
              <p className="text-sm text-surface-500">
                Minimum payout: $50 • Weekly processing
              </p>
            </div>
            {affiliate.stats.pendingEarnings >= 50 && (
              <Button onClick={requestPayout} size="sm">
                Request Payout (${affiliate.stats.pendingEarnings.toFixed(2)})
              </Button>
            )}
          </div>
          <div className="divide-y divide-surface-100">
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                No payouts yet. Build up $50 in earnings to request your first payout.
              </div>
            ) : (
              payouts.map((payout) => (
                <div key={payout.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">
                        ${payout.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-surface-500">
                        {payout.method} • {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payout.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : payout.status === "processing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {payout.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Link
            href="/affiliates/resources"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-surface-900">Marketing Resources</h3>
              <p className="text-sm text-surface-500">Banners, emails, and more</p>
            </div>
            <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-brand-500 transition-colors" />
          </Link>

          <Link
            href="/affiliates/settings"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-surface-900">Payout Settings</h3>
              <p className="text-sm text-surface-500">Update payment method</p>
            </div>
            <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-brand-500 transition-colors" />
          </Link>

          <Link
            href="/affiliates/leaderboard"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-surface-900">Leaderboard</h3>
              <p className="text-sm text-surface-500">See top performers</p>
            </div>
            <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-brand-500 transition-colors" />
          </Link>
        </div>
      </main>
    </div>
  );
}
