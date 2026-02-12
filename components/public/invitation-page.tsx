"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EventDetails } from "./event-details";
import { RSVPForm } from "./rsvp-form";
import { ResponseConfirmation } from "./response-confirmation";
import { QRCodeSimple } from "@/components/invitation/qr-code";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink } from "lucide-react";

interface InvitationPageProps {
  invitation: {
    id: string;
    title: string;
    description?: string;
    date: Date;
    endDate?: Date;
    location?: string;
    locationUrl?: string;
    dresscode?: string;
    capacity?: number;
    currentRsvps?: number;
    additionalInfo?: string[];
    imageUrl?: string;
    hostName?: string;
  };
  publicUrl: string;
  existingResponse?: {
    response: "attending" | "not_attending" | "maybe";
    guestName: string;
    guestCount: number;
  } | null;
  onSubmitRsvp: (data: {
    name: string;
    email: string;
    response: "attending" | "not_attending" | "maybe";
    guestCount?: number;
    dietaryRestrictions?: string;
    message?: string;
  }) => Promise<void>;
  className?: string;
}

export function InvitationPage({
  invitation,
  publicUrl,
  existingResponse,
  onSubmitRsvp,
  className,
}: InvitationPageProps) {
  const [showRsvpForm, setShowRsvpForm] = useState(!existingResponse);
  const [currentResponse, setCurrentResponse] = useState(existingResponse);

  const handleSubmitRsvp = async (data: {
    name: string;
    email: string;
    response: "attending" | "not_attending" | "maybe";
    guestCount?: number;
    dietaryRestrictions?: string;
    message?: string;
  }) => {
    await onSubmitRsvp(data);
    setCurrentResponse({
      response: data.response,
      guestName: data.name,
      guestCount: data.guestCount || 1,
    });
    setShowRsvpForm(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: invitation.title,
        text: `You're invited to ${invitation.title}!`,
        url: publicUrl,
      });
    } else {
      await navigator.clipboard.writeText(publicUrl);
      // Could show a toast here
    }
  };

  return (
    <div className={cn("min-h-screen bg-surface-50 dark:bg-surface-950", className)}>
      {/* Hero Image */}
      {invitation.imageUrl && (
        <div className="relative h-64 md:h-96 w-full">
          <img
            src={invitation.imageUrl}
            alt={invitation.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold">{invitation.title}</h1>
            {invitation.hostName && (
              <p className="text-white/80 mt-1">Hosted by {invitation.hostName}</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Title (if no hero image) */}
        {!invitation.imageUrl && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{invitation.title}</h1>
            {invitation.hostName && (
              <p className="text-muted-foreground mt-1">
                Hosted by {invitation.hostName}
              </p>
            )}
          </div>
        )}

        {/* Event Details */}
        <EventDetails
          title={invitation.title}
          description={invitation.description}
          date={invitation.date}
          endDate={invitation.endDate}
          location={invitation.location}
          locationUrl={invitation.locationUrl}
          dresscode={invitation.dresscode}
          capacity={invitation.capacity}
          currentRsvps={invitation.currentRsvps}
          additionalInfo={invitation.additionalInfo}
          className="mb-6"
        />

        {/* RSVP Section */}
        {showRsvpForm ? (
          <RSVPForm
            eventTitle={invitation.title}
            maxGuests={5}
            showDietaryField={true}
            showMessageField={true}
            onSubmit={handleSubmitRsvp}
            className="mb-6"
          />
        ) : currentResponse ? (
          <ResponseConfirmation
            response={currentResponse.response}
            eventTitle={invitation.title}
            eventDate={invitation.date}
            eventEndDate={invitation.endDate}
            eventLocation={invitation.location}
            guestName={currentResponse.guestName}
            guestCount={currentResponse.guestCount}
            onChangeResponse={() => setShowRsvpForm(true)}
            onShare={handleShare}
            className="mb-6"
          />
        ) : null}

        {/* Share & QR Code Section */}
        <div className="flex flex-col items-center gap-4 p-6 bg-surface-100 dark:bg-surface-900 rounded-lg">
          <p className="text-sm text-muted-foreground">Share this invitation</p>
          <QRCodeSimple
            value={publicUrl}
            size={100}
            label="Scan to view invitation"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(publicUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Link
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 py-4 text-sm text-muted-foreground border-t">
          <p>
            Powered by{" "}
            <a href="/" className="text-primary hover:underline">
              InviteGenerator
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// Loading skeleton for invitation page
export function InvitationPageSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Hero Skeleton */}
      <div className="h-64 md:h-96 w-full bg-surface-200 dark:bg-surface-800 animate-pulse" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Event Details Skeleton */}
        <div className="bg-white dark:bg-surface-900 rounded-lg p-6 mb-6">
          <div className="h-6 w-48 bg-surface-200 dark:bg-surface-800 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
          </div>
        </div>

        {/* RSVP Skeleton */}
        <div className="bg-white dark:bg-surface-900 rounded-lg p-6">
          <div className="h-6 w-24 bg-surface-200 dark:bg-surface-800 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-10 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-10 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="h-10 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
