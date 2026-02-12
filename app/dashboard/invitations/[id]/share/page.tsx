"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Link2, Mail, QrCode, Calendar, Copy, Check, ExternalLink, Download } from "lucide-react";

import { useInvitationStore } from "@/lib/stores";
import { PageHeader } from "@/components/layout";
import { ShareDialog, ShareButtons, EmailInviteForm } from "@/components/share";
import { QRCodeDownload } from "@/components/invitation";
import { AddToCalendar, type CalendarEvent } from "@/components/invitation";
import { InvitationDownload, PrintGuide } from "@/components/invitation";
import { useAuthStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopyToClipboard } from "@/hooks";

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentInvitation, fetchInvitation, isLoading } = useInvitationStore();
  const { user } = useAuthStore();
  const { copy, copied } = useCopyToClipboard();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [emailsSent, setEmailsSent] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchInvitation(id).catch(() => {
        toast.error("Failed to load invitation");
        router.push("/dashboard");
      });
    }
  }, [id, fetchInvitation, router]);

  if (isLoading || !currentInvitation) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading invitation...</span>
      </div>
    );
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${currentInvitation.shortId}`;

  const handleCopyLink = () => {
    copy(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleSendEmails = async (recipients: { email: string; name?: string }[], message: string) => {
    try {
      const response = await fetch(`/api/invitations/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, message }),
      });

      if (!response.ok) throw new Error("Failed to send emails");

      setEmailsSent((prev) => [...prev, ...recipients.map((r) => r.email)]);
      toast.success(`Invitation sent to ${recipients.length} recipient(s)!`);
    } catch (error) {
      console.error("Email send error:", error);
      toast.error("Failed to send emails. Please try again.");
    }
  };

  const handleDownloadQR = () => {
    toast.success("QR code downloaded!");
  };

  // Get location as string
  const locationString = typeof currentInvitation.location === "string"
    ? currentInvitation.location
    : currentInvitation.location?.address || "";

  // Calendar event data
  const calendarEvent: CalendarEvent = {
    title: currentInvitation.title,
    description: currentInvitation.description || "",
    startDate: new Date(currentInvitation.eventDate),
    endDate: new Date(new Date(currentInvitation.eventDate).getTime() + 2 * 60 * 60 * 1000), // 2 hours
    location: locationString,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Share Invitation"
        description={`Share "${currentInvitation.title}" with your guests`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invitations", href: "/dashboard/invitations" },
          { label: currentInvitation.title, href: `/dashboard/invitations/${id}` },
          { label: "Share" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.open(shareUrl, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => setShowShareDialog(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              Quick Share
            </Button>
          </div>
        }
      />

      {/* Status Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Your invitation link</p>
                <p className="text-sm text-muted-foreground">{shareUrl}</p>
              </div>
            </div>
            <Button onClick={handleCopyLink} variant={copied ? "secondary" : "primary"}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="qr" className="gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="download" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Email Invitations</CardTitle>
                <CardDescription>
                  Send personalized email invitations to your guests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailInviteForm
                  onSend={handleSendEmails}
                  invitationTitle={currentInvitation.title}
                  invitationUrl={shareUrl}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sent Invitations</CardTitle>
                <CardDescription>
                  Track who has received your invitation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailsSent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No emails sent yet</p>
                    <p className="text-sm">Send your first invitation using the form</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emailsSent.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-lg"
                      >
                        <span className="text-sm">{email}</span>
                        <Badge variant="success">Sent</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code</CardTitle>
                <CardDescription>
                  Download and share your invitation QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <QRCodeDownload
                  value={shareUrl}
                  title={currentInvitation.title}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
                <CardDescription>
                  Tips for using your QR code effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Print it</p>
                    <p className="text-sm text-muted-foreground">
                      Add the QR code to printed invitations or event materials
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Display it</p>
                    <p className="text-sm text-muted-foreground">
                      Show at the event venue for easy check-in access
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Share digitally</p>
                    <p className="text-sm text-muted-foreground">
                      Include in social media posts or digital communications
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Download Tab */}
        <TabsContent value="download" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Download for Print</CardTitle>
                <CardDescription>
                  Download your invitation in various formats for printing at home or professional print shops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvitationDownload
                  invitation={currentInvitation}
                  userPlan={user?.plan || "free"}
                  onDownload={(format, size) => {
                    toast.success(`Downloaded ${format} in ${size} format`);
                  }}
                />
              </CardContent>
            </Card>

            <PrintGuide />
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add to Calendar</CardTitle>
                <CardDescription>
                  Help guests save the date on their preferred calendar
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <AddToCalendar event={calendarEvent} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
                <CardDescription>
                  Information included in the calendar event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Event</p>
                  <p className="font-medium">{currentInvitation.title}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {new Date(currentInvitation.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {locationString && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{locationString}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
        title={currentInvitation.title}
        description={currentInvitation.description}
        onEmailShare={() => {
          setShowShareDialog(false);
          // Switch to email tab
        }}
        onDownloadQR={handleDownloadQR}
      />
    </div>
  );
}
