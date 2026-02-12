"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, StatsGrid } from "./stats-card";
import type { Invitation, RSVPResponse } from "@/types";
import {
  FileText,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface AnalyticsOverviewProps {
  invitations: Invitation[];
  rsvpResponses?: RSVPResponse[];
  className?: string;
}

export function AnalyticsOverview({
  invitations,
  rsvpResponses = [],
  className,
}: AnalyticsOverviewProps) {
  const stats = useMemo(() => {
    const totalInvitations = invitations.length;
    const publishedInvitations = invitations.filter((i) => i.status === "published").length;
    const draftInvitations = invitations.filter((i) => i.status === "draft").length;
    const totalViews = invitations.reduce((sum, i) => sum + (i.viewCount || 0), 0);

    const totalRsvps = rsvpResponses.length;
    const attending = rsvpResponses.filter((r) => r.response === "attending").length;
    const notAttending = rsvpResponses.filter((r) => r.response === "not_attending").length;
    const maybe = rsvpResponses.filter((r) => r.response === "maybe").length;

    // Calculate upcoming events (within next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = invitations.filter((i) => {
      const eventDate = new Date(i.eventDate);
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    }).length;

    // Response rate
    const responseRate = totalRsvps > 0 ? Math.round((attending / totalRsvps) * 100) : 0;

    return {
      totalInvitations,
      publishedInvitations,
      draftInvitations,
      totalViews,
      totalRsvps,
      attending,
      notAttending,
      maybe,
      upcomingEvents,
      responseRate,
    };
  }, [invitations, rsvpResponses]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Invitations"
          value={stats.totalInvitations}
          icon={FileText}
          description={`${stats.publishedInvitations} published, ${stats.draftInvitations} drafts`}
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          trend={{ value: 12, label: "vs last month" }}
        />
        <StatsCard
          title="Total RSVPs"
          value={stats.totalRsvps}
          icon={Users}
          description={`${stats.attending} attending`}
        />
        <StatsCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={Calendar}
          description="In the next 30 days"
        />
      </StatsGrid>

      {/* RSVP Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RSVP Summary</CardTitle>
          <CardDescription>Response breakdown across all invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.attending}</p>
                <p className="text-xs text-muted-foreground">Attending</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.notAttending}</p>
                <p className="text-xs text-muted-foreground">Not Attending</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.maybe}</p>
                <p className="text-xs text-muted-foreground">Maybe</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.responseRate}%</p>
                <p className="text-xs text-muted-foreground">Acceptance Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple RSVP progress bar
interface RSVPProgressProps {
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  className?: string;
}

export function RSVPProgress({
  attending,
  notAttending,
  maybe,
  pending,
  className,
}: RSVPProgressProps) {
  const total = attending + notAttending + maybe + pending;
  if (total === 0) return null;

  const getPercent = (value: number) => Math.round((value / total) * 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2 rounded-full overflow-hidden bg-surface-100">
        {attending > 0 && (
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${getPercent(attending)}%` }}
          />
        )}
        {maybe > 0 && (
          <div
            className="bg-amber-500 transition-all"
            style={{ width: `${getPercent(maybe)}%` }}
          />
        )}
        {notAttending > 0 && (
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${getPercent(notAttending)}%` }}
          />
        )}
        {pending > 0 && (
          <div
            className="bg-surface-300 transition-all"
            style={{ width: `${getPercent(pending)}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {attending} attending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {maybe} maybe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {notAttending} declined
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-surface-300" />
          {pending} pending
        </span>
      </div>
    </div>
  );
}
