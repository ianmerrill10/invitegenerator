"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Mail,
  Users,
  Eye,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatRelativeDate, getDaysUntilEvent } from "@/lib/utils";
import { useAuthStore, useInvitationStore } from "@/lib/stores";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Quick action cards
const quickActions = [
  {
    title: "Create Invitation",
    description: "Start with AI or choose a template",
    icon: Plus,
    href: "/dashboard/create",
    color: "brand",
  },
  {
    title: "Browse Templates",
    description: "100+ professional designs",
    icon: Sparkles,
    href: "/dashboard/templates",
    color: "accent",
  },
  {
    title: "View RSVPs",
    description: "Track guest responses",
    icon: Users,
    href: "/dashboard/rsvp",
    color: "success",
  },
];

// Stat cards data
const getStatCards = (invitations: any[]) => {
  const totalInvitations = invitations.length;
  const publishedInvitations = invitations.filter((i) => i.status === "published").length;
  const totalViews = invitations.reduce((sum, i) => sum + (i.viewCount || 0), 0);
  const totalRSVPs = 0; // Would come from RSVP data

  return [
    {
      title: "Total Invitations",
      value: totalInvitations,
      change: "+2 this month",
      icon: Mail,
      color: "brand",
    },
    {
      title: "Published",
      value: publishedInvitations,
      change: `${totalInvitations - publishedInvitations} drafts`,
      icon: Eye,
      color: "success",
    },
    {
      title: "Total Views",
      value: totalViews,
      change: "+12% from last week",
      icon: TrendingUp,
      color: "accent",
    },
    {
      title: "RSVPs Collected",
      value: totalRSVPs,
      change: "All events",
      icon: Users,
      color: "warning",
    },
  ];
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { invitations, fetchInvitations, isLoading } = useInvitationStore();
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  // Fetch invitations on mount
  React.useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const statCards = getStatCards(invitations);

  // Get recent invitations (max 5)
  const recentInvitations = [...invitations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Get upcoming events (invitations with future dates)
  const upcomingEvents = invitations
    .filter((inv) => getDaysUntilEvent(inv.eventDate) > 0)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold text-surface-900 mb-2">
          Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-surface-600">
          Here's what's happening with your invitations
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card variant="interactive" padding="md" className="h-full">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                    action.color === "brand" && "bg-brand-100 text-brand-600",
                    action.color === "accent" && "bg-accent-100 text-accent-600",
                    action.color === "success" && "bg-success-100 text-success-600"
                  )}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-surface-900">
                    {action.title}
                  </h3>
                  <p className="text-sm text-surface-500">{action.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-heading font-bold text-surface-900">
                  {stat.value}
                </p>
                <p className="text-xs text-surface-400 mt-1">{stat.change}</p>
              </div>
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  stat.color === "brand" && "bg-brand-100 text-brand-600",
                  stat.color === "accent" && "bg-accent-100 text-accent-600",
                  stat.color === "success" && "bg-success-100 text-success-600",
                  stat.color === "warning" && "bg-warning-100 text-warning-600"
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent invitations */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
              <h2 className="font-heading font-semibold text-lg text-surface-900">
                Recent Invitations
              </h2>
              <Link href="/dashboard/invitations">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  View all
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-surface-500">
                Loading invitations...
              </div>
            ) : recentInvitations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-surface-400" />
                </div>
                <h3 className="font-heading font-semibold text-surface-900 mb-2">
                  No invitations yet
                </h3>
                <p className="text-surface-500 mb-4">
                  Create your first invitation to get started
                </p>
                <Link href="/dashboard/create">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    Create Invitation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-surface-100">
                {recentInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-surface-50 transition-colors"
                  >
                    {/* Preview thumbnail */}
                    <div className="h-16 w-12 rounded-lg bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-brand-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-surface-900 truncate">
                          {invitation.title}
                        </h3>
                        <Badge
                          variant={
                            invitation.status === "published"
                              ? "success"
                              : invitation.status === "draft"
                              ? "default"
                              : "warning"
                          }
                          size="sm"
                        >
                          {invitation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-surface-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(invitation.eventDate, "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {invitation.viewCount || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelativeDate(invitation.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          setActiveMenu(activeMenu === invitation.id ? null : invitation.id)
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeMenu === invitation.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenu(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-elevated border border-surface-200 py-1 z-20">
                            <Link
                              href={`/dashboard/invitations/${invitation.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-100"
                              onClick={() => setActiveMenu(null)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-600 hover:bg-surface-100">
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            {invitation.status === "published" && (
                              <a
                                href={invitation.shareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-100"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Live
                              </a>
                            )}
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-600 hover:bg-error-50">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Upcoming events */}
        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="px-6 py-4 border-b border-surface-200">
              <h2 className="font-heading font-semibold text-lg text-surface-900">
                Upcoming Events
              </h2>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-surface-500">
                No upcoming events
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {upcomingEvents.map((event) => {
                  const daysUntil = getDaysUntilEvent(event.eventDate);
                  return (
                    <div
                      key={event.id}
                      className="p-4 rounded-xl bg-surface-50 border border-surface-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-surface-900 truncate">
                          {event.title}
                        </h3>
                        <Badge
                          variant={daysUntil <= 7 ? "warning" : "default"}
                          size="sm"
                        >
                          {daysUntil === 1
                            ? "Tomorrow"
                            : daysUntil === 0
                            ? "Today"
                            : `${daysUntil} days`}
                        </Badge>
                      </div>
                      <p className="text-sm text-surface-500">
                        {formatDate(event.eventDate, "EEEE, MMMM d")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* AI Credits */}
          <Card className="mt-4" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-surface-900">
                  AI Credits
                </h3>
                <p className="text-sm text-surface-500">
                  {user?.creditsRemaining || 0} remaining
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(((user?.creditsRemaining || 0) / 5) * 100, 100)}%`,
                }}
              />
            </div>

            <p className="text-xs text-surface-500">
              Credits reset monthly. Upgrade for more.
            </p>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
