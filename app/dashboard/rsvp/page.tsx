"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Download,
  Filter,
  Search,
  Mail,
  Calendar,
  Loader2,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyRSVPs } from "@/components/ui/empty-state";
import { RSVPProgress, StatsCard, StatsGrid } from "@/components/dashboard";
import { PageHeader } from "@/components/layout";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import { useInvitationStore } from "@/lib/stores";
import type { RSVPResponse, Invitation } from "@/types";

type ResponseFilter = "all" | "attending" | "not_attending" | "maybe" | "pending";

export default function RSVPDashboardPage() {
  const { invitations, fetchInvitations, isLoading } = useInvitationStore();

  const [rsvpResponses, setRsvpResponses] = React.useState<RSVPResponse[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [responseFilter, setResponseFilter] = React.useState<ResponseFilter>("all");
  const [invitationFilter, setInvitationFilter] = React.useState<string>("all");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Fetch RSVPs from API
  const fetchRsvps = React.useCallback(async () => {
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

  // Fetch invitations and RSVPs on mount
  React.useEffect(() => {
    fetchInvitations();
    fetchRsvps();
  }, [fetchInvitations, fetchRsvps]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const attending = rsvpResponses.filter((r) => r.response === "attending");
    const notAttending = rsvpResponses.filter((r) => r.response === "not_attending");
    const maybe = rsvpResponses.filter((r) => r.response === "maybe");
    const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

    return {
      total: rsvpResponses.length,
      attending: attending.length,
      notAttending: notAttending.length,
      maybe: maybe.length,
      totalGuests,
      responseRate: rsvpResponses.length > 0
        ? Math.round((attending.length / rsvpResponses.length) * 100)
        : 0,
    };
  }, [rsvpResponses]);

  // Filter responses
  const filteredResponses = React.useMemo(() => {
    let result = [...rsvpResponses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.guestName.toLowerCase().includes(query) ||
          r.guestEmail.toLowerCase().includes(query)
      );
    }

    // Response type filter
    if (responseFilter !== "all") {
      result = result.filter((r) => r.response === responseFilter);
    }

    // Invitation filter
    if (invitationFilter !== "all") {
      result = result.filter((r) => r.invitationId === invitationFilter);
    }

    // Sort by most recent
    result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return result;
  }, [rsvpResponses, searchQuery, responseFilter, invitationFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchInvitations(), fetchRsvps()]);
      toast.success("RSVPs refreshed");
    } catch (error) {
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (filteredResponses.length === 0) {
      toast.error("No responses to export");
      return;
    }

    // Create CSV content
    const headers = ["Name", "Email", "Response", "Guests", "Dietary Restrictions", "Message", "Event", "Submitted At"];
    const rows = filteredResponses.map((r) => [
      r.guestName,
      r.guestEmail,
      r.response,
      r.guestCount.toString(),
      r.dietaryRestrictions || "",
      r.message || "",
      getInvitationTitle(r.invitationId),
      formatDate(r.submittedAt, "yyyy-MM-dd HH:mm"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    // Download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rsvp-responses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("RSVPs exported to CSV");
  };

  const getInvitationTitle = (invitationId: string): string => {
    const inv = invitations.find((i) => i.id === invitationId);
    return inv?.title || "Unknown Event";
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case "attending":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "not_attending":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "maybe":
        return <HelpCircle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getResponseBadge = (response: string) => {
    switch (response) {
      case "attending":
        return <Badge variant="success">Attending</Badge>;
      case "not_attending":
        return <Badge variant="error">Not Attending</Badge>;
      case "maybe":
        return <Badge variant="warning">Maybe</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if ((isLoading && invitations.length === 0) || isLoadingRsvps) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <span className="ml-2 text-muted-foreground">Loading RSVPs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="RSVP Management"
        description="Track and manage guest responses across all your events"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "RSVPs" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Responses"
          value={stats.total}
          icon={Users}
          description={`${stats.totalGuests} total guests`}
        />
        <StatsCard
          title="Attending"
          value={stats.attending}
          icon={CheckCircle}
          trend={{ value: stats.responseRate, label: "response rate" }}
        />
        <StatsCard
          title="Not Attending"
          value={stats.notAttending}
          icon={XCircle}
        />
        <StatsCard
          title="Maybe"
          value={stats.maybe}
          icon={HelpCircle}
          description="Awaiting confirmation"
        />
      </StatsGrid>

      {/* RSVP Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RSVPProgress
              attending={stats.attending}
              notAttending={stats.notAttending}
              maybe={stats.maybe}
              pending={0}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">By Event</CardTitle>
            <CardDescription>RSVPs grouped by invitation</CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No invitations yet
              </p>
            ) : (
              <div className="space-y-3">
                {invitations.slice(0, 5).map((invitation) => {
                  const invRsvps = rsvpResponses.filter((r) => r.invitationId === invitation.id);
                  const attending = invRsvps.filter((r) => r.response === "attending").length;
                  return (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{invitation.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(invitation.eventDate, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{invRsvps.length} responses</Badge>
                        <Badge variant="success">{attending} attending</Badge>
                        <Link href={`/dashboard/invitations/${invitation.id}/rsvp`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={responseFilter} onValueChange={(v) => setResponseFilter(v as ResponseFilter)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Response" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Responses</SelectItem>
            <SelectItem value="attending">Attending</SelectItem>
            <SelectItem value="not_attending">Not Attending</SelectItem>
            <SelectItem value="maybe">Maybe</SelectItem>
          </SelectContent>
        </Select>

        <Select value={invitationFilter} onValueChange={setInvitationFilter}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {invitations.map((inv) => (
              <SelectItem key={inv.id} value={inv.id}>
                {inv.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredResponses.length} of {rsvpResponses.length} responses
      </div>

      {/* Response List */}
      {filteredResponses.length === 0 ? (
        searchQuery || responseFilter !== "all" || invitationFilter !== "all" ? (
          <Card className="p-8">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setResponseFilter("all");
                  setInvitationFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <EmptyRSVPs />
        )
      ) : (
        <Card>
          <div className="divide-y">
            {filteredResponses.map((rsvp) => (
              <div
                key={rsvp.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getResponseIcon(rsvp.response)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rsvp.guestName}</h4>
                        {getResponseBadge(rsvp.response)}
                        {rsvp.guestCount > 1 && (
                          <Badge variant="outline">+{rsvp.guestCount - 1} guests</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rsvp.guestEmail}</p>
                      {rsvp.message && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          &ldquo;{rsvp.message}&rdquo;
                        </p>
                      )}
                      {rsvp.dietaryRestrictions && (
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">Dietary: </span>
                          {rsvp.dietaryRestrictions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm shrink-0">
                    <p className="text-muted-foreground">
                      {formatRelativeDate(rsvp.submittedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getInvitationTitle(rsvp.invitationId)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
