"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, TrendingUp, Users, FileText, Eye, Download, RefreshCcw } from "lucide-react";

import { useInvitationStore } from "@/lib/stores";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout";
import { AnalyticsOverview, RSVPProgress, StatsCard, StatsGrid } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Invitation, RSVPResponse } from "@/types";

export default function AnalyticsPage() {
  const router = useRouter();
  const { invitations, fetchInvitations, isLoading } = useInvitationStore();
  const [timeRange, setTimeRange] = useState("30d");
  const [rsvpResponses, setRsvpResponses] = useState<RSVPResponse[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch RSVPs from API
  const fetchRsvps = useCallback(async () => {
    try {
      const response = await fetch("/api/rsvp/all");
      if (response.ok) {
        const data = await response.json();
        setRsvpResponses(data.data?.responses || []);
      }
    } catch (error) {
      console.error("Failed to fetch RSVPs:", error);
    } finally {
      setIsLoadingRsvps(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations().catch(() => {
      toast.error("Failed to load analytics data");
    });
    fetchRsvps();
  }, [fetchInvitations, fetchRsvps]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchInvitations(), fetchRsvps()]);
      toast.success("Analytics refreshed");
    } catch (error) {
      toast.error("Failed to refresh analytics");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    if (invitations.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create analytics CSV with invitation stats
    const headers = ["Title", "Event Type", "Event Date", "Status", "Views", "RSVPs", "Attending", "Created At"];
    const rows = invitations.map((inv) => {
      const invRsvps = rsvpResponses.filter(r => r.invitationId === inv.id);
      const attending = invRsvps.filter(r => r.response === "attending").length;
      return [
        inv.title,
        inv.eventType?.replace("_", " ") || "Other",
        formatDate(inv.eventDate, "yyyy-MM-dd"),
        inv.status,
        (inv.viewCount || 0).toString(),
        invRsvps.length.toString(),
        attending.toString(),
        formatDate(inv.createdAt, "yyyy-MM-dd"),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    // Download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Analytics data exported");
  };

  // Calculate quick stats
  const quickStats = {
    totalInvitations: invitations.length,
    publishedCount: invitations.filter(i => i.status === "published").length,
    totalViews: invitations.reduce((sum, i) => sum + (i.viewCount || 0), 0),
    totalRsvps: rsvpResponses.length,
    attendingCount: rsvpResponses.filter(r => r.response === "attending").length,
    responseRate: rsvpResponses.length > 0
      ? Math.round((rsvpResponses.filter(r => r.response === "attending").length / rsvpResponses.length) * 100)
      : 0,
  };

  if ((isLoading && invitations.length === 0) || isLoadingRsvps) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your invitation performance and guest engagement"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Analytics" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Invitations"
          value={quickStats.totalInvitations}
          icon={FileText}
          description={`${quickStats.publishedCount} published`}
        />
        <StatsCard
          title="Total Views"
          value={quickStats.totalViews.toLocaleString()}
          icon={Eye}
          trend={{ value: 15, label: "vs last period" }}
        />
        <StatsCard
          title="Total RSVPs"
          value={quickStats.totalRsvps}
          icon={Users}
          description={`${quickStats.attendingCount} attending`}
        />
        <StatsCard
          title="Response Rate"
          value={`${quickStats.responseRate}%`}
          icon={TrendingUp}
          trend={{ value: 5, label: "vs last period" }}
        />
      </StatsGrid>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <AnalyticsOverview
            invitations={invitations}
            rsvpResponses={rsvpResponses}
          />
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Invitations</CardTitle>
                <CardDescription>By views and RSVPs</CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No invitations yet</p>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => router.push("/dashboard/create")}
                    >
                      Create your first invitation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations
                      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                      .slice(0, 5)
                      .map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-lg cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"
                          onClick={() => router.push(`/dashboard/invitations/${invitation.id}`)}
                        >
                          <div>
                            <p className="font-medium">{invitation.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(invitation.eventDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{invitation.viewCount || 0} views</p>
                            <p className="text-sm text-muted-foreground">
                              {rsvpResponses.filter(r => r.invitationId === invitation.id).length} RSVPs
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <CardDescription>Events in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.filter(i => {
                  const eventDate = new Date(i.eventDate);
                  const now = new Date();
                  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                  return eventDate >= now && eventDate <= thirtyDays;
                }).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations
                      .filter(i => {
                        const eventDate = new Date(i.eventDate);
                        const now = new Date();
                        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                        return eventDate >= now && eventDate <= thirtyDays;
                      })
                      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                      .slice(0, 5)
                      .map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{invitation.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(invitation.eventDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {Math.ceil((new Date(invitation.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RSVP Details Tab */}
        <TabsContent value="rsvp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">RSVP Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <RSVPProgress
                  attending={rsvpResponses.filter(r => r.response === "attending").length}
                  notAttending={rsvpResponses.filter(r => r.response === "not_attending").length}
                  maybe={rsvpResponses.filter(r => r.response === "maybe").length}
                  pending={0}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent RSVPs</CardTitle>
                <CardDescription>Latest guest responses</CardDescription>
              </CardHeader>
              <CardContent>
                {rsvpResponses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No RSVPs yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rsvpResponses.slice(0, 10).map((rsvp) => (
                      <div
                        key={rsvp.id}
                        className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{rsvp.guestName}</p>
                          <p className="text-sm text-muted-foreground">{rsvp.guestEmail}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rsvp.response === "attending"
                              ? "bg-success/10 text-success"
                              : rsvp.response === "not_attending"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                          }`}>
                            {rsvp.response === "attending" ? "Attending" : rsvp.response === "not_attending" ? "Not Attending" : "Maybe"}
                          </span>
                          {rsvp.guestCount > 1 && (
                            <p className="text-sm text-muted-foreground mt-1">+{rsvp.guestCount - 1} guests</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
