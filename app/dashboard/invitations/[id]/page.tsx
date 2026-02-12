"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Edit,
  Share2,
  Users,
  Eye,
  ExternalLink,
  Copy,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Mail,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout";
import { StatsCard, StatsGrid, RSVPProgress } from "@/components/dashboard";
import { QRCodeDownload } from "@/components/invitation";
import { formatDate, getDaysUntilEvent } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks";
import { useInvitationStore } from "@/lib/stores";
import type { RSVPResponse } from "@/types";

// Mock RSVP data - replace with actual API
const mockRsvpData: RSVPResponse[] = [
  { id: "1", invitationId: "inv1", guestName: "John Doe", guestEmail: "john@example.com", response: "attending", guestCount: 2, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", invitationId: "inv1", guestName: "Jane Smith", guestEmail: "jane@example.com", response: "attending", guestCount: 1, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", invitationId: "inv1", guestName: "Bob Wilson", guestEmail: "bob@example.com", response: "not_attending", guestCount: 0, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "4", invitationId: "inv1", guestName: "Alice Brown", guestEmail: "alice@example.com", response: "maybe", guestCount: 2, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export default function InvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentInvitation, fetchInvitation, deleteInvitation, isLoading } = useInvitationStore();
  const [rsvpResponses] = React.useState<RSVPResponse[]>(mockRsvpData);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { copy } = useCopyToClipboard();

  React.useEffect(() => {
    if (id) {
      fetchInvitation(id).catch(() => {
        toast.error("Failed to load invitation");
        router.push("/dashboard/invitations");
      });
    }
  }, [id, fetchInvitation, router]);

  // Calculate RSVP stats
  const rsvpStats = React.useMemo(() => {
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
    };
  }, [rsvpResponses]);

  const handleCopyLink = async () => {
    if (currentInvitation?.shortId) {
      const url = `${window.location.origin}/i/${currentInvitation.shortId}`;
      const success = await copy(url);
      if (success) {
        toast.success("Link copied to clipboard");
      } else {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invitation? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInvitation(id);
      toast.success("Invitation deleted");
      router.push("/dashboard/invitations");
    } catch (error) {
      toast.error("Failed to delete invitation");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !currentInvitation) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <span className="ml-2 text-muted-foreground">Loading invitation...</span>
      </div>
    );
  }

  const daysUntil = getDaysUntilEvent(currentInvitation.eventDate);
  const isPast = daysUntil < 0;
  const isPublished = currentInvitation.status === "published";
  const locationString = typeof currentInvitation.location === "string"
    ? currentInvitation.location
    : currentInvitation.location?.address || currentInvitation.location?.name || "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentInvitation.title}
        description={`${currentInvitation.eventType?.replace("_", " ")} event`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invitations", href: "/dashboard/invitations" },
          { label: currentInvitation.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/invitations/${id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Design
              </Button>
            </Link>
            <Link href={`/dashboard/invitations/${id}/share`}>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                {isPublished && currentInvitation.shortId && (
                  <DropdownMenuItem asChild>
                    <a href={`/i/${currentInvitation.shortId}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Status Banner */}
      {!isPublished && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium">This invitation is in draft mode</p>
              <p className="text-sm text-muted-foreground">Publish it to start collecting RSVPs</p>
            </div>
          </div>
          <Button>Publish Now</Button>
        </div>
      )}

      {/* Quick Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Views"
          value={currentInvitation.viewCount || 0}
          icon={Eye}
        />
        <StatsCard
          title="RSVPs"
          value={rsvpStats.total}
          icon={Users}
          description={`${rsvpStats.totalGuests} total guests`}
        />
        <StatsCard
          title="Attending"
          value={rsvpStats.attending}
          icon={CheckCircle}
        />
        <StatsCard
          title="Days Until Event"
          value={isPast ? "Past" : daysUntil}
          icon={Calendar}
          description={isPast ? "Event has passed" : daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : undefined}
        />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDate(currentInvitation.eventDate, "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              {currentInvitation.eventTime && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{currentInvitation.eventTime}</p>
                  </div>
                </div>
              )}

              {locationString && (
                <div className="flex items-start gap-3 col-span-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{locationString}</p>
                  </div>
                </div>
              )}
            </div>

            {currentInvitation.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{currentInvitation.description}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t flex flex-wrap gap-2">
              <Link href={`/dashboard/invitations/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Design
                </Button>
              </Link>
              <Link href={`/dashboard/invitations/${id}/guests`}>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Guests
                </Button>
              </Link>
              <Link href={`/dashboard/invitations/${id}/rsvp`}>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View RSVPs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* QR Code & Share */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Share</CardTitle>
            <CardDescription>Share your invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPublished && currentInvitation.shortId ? (
              <>
                <div className="flex justify-center">
                  <QRCodeDownload
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/i/${currentInvitation.shortId}`}
                    title={currentInvitation.title}
                  />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Link href={`/dashboard/invitations/${id}/share`} className="block">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Invites
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Publish your invitation to share it
                </p>
                <Button className="w-full">Publish Now</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RSVP Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">RSVP Overview</CardTitle>
            <CardDescription>Guest responses for this event</CardDescription>
          </div>
          <Link href={`/dashboard/invitations/${id}/rsvp`}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RSVPProgress
              attending={rsvpStats.attending}
              notAttending={rsvpStats.notAttending}
              maybe={rsvpStats.maybe}
              pending={0}
            />

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Recent Responses</h4>
              {rsvpResponses.slice(0, 4).map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {rsvp.response === "attending" && <CheckCircle className="h-4 w-4 text-success" />}
                    {rsvp.response === "not_attending" && <XCircle className="h-4 w-4 text-destructive" />}
                    {rsvp.response === "maybe" && <HelpCircle className="h-4 w-4 text-warning" />}
                    <span className="text-sm">{rsvp.guestName}</span>
                  </div>
                  <Badge variant="outline" size="sm">
                    {rsvp.guestCount > 1 ? `+${rsvp.guestCount - 1}` : "1"} guest{rsvp.guestCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
