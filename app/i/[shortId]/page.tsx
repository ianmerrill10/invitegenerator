"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Invitation } from "@/types";

interface PublicInvitationData {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  eventDate: string;
  eventTime?: string;
  location: {
    name: string;
    address?: string;
    city?: string;
    virtual?: boolean;
    virtualLink?: string;
    mapUrl?: string;
  };
  hostName: string;
  designData: Invitation["designData"];
  rsvpSettings: {
    enabled: boolean;
    deadline?: string;
    allowPlusOne?: boolean;
    plusOneLimit?: number;
  };
}

export default function PublicInvitationPage() {
  const params = useParams();
  const shortId = params.shortId as string;

  const [invitation, setInvitation] = useState<PublicInvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/public/invitation/${shortId}`);
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setError("Invitation not found");
          } else if (response.status === 410) {
            setError("This invitation is no longer available");
          } else {
            setError(result.error?.message || "Failed to load invitation");
          }
          return;
        }

        setInvitation(result.data);
      } catch (err) {
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    }

    if (shortId) {
      fetchInvitation();
    }
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">
            {error || "Invitation Not Found"}
          </h1>
          <p className="text-surface-600 mb-6">
            The invitation you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button variant="primary">Create Your Own Invitation</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isRsvpClosed = invitation.rsvpSettings.deadline
    ? new Date(invitation.rsvpSettings.deadline) < new Date()
    : false;

  const formatEventDate = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    let formatted = date.toLocaleDateString("en-US", options);
    if (timeStr) {
      formatted += ` at ${timeStr}`;
    }
    return formatted;
  };

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${invitation.designData?.primaryColor || "#FF6B47"}11, ${invitation.designData?.secondaryColor || "#14B8A6"}11)`,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Badge variant="secondary" className="mb-3">
          You're Invited!
        </Badge>
        <h1
          className="text-3xl md:text-5xl font-display font-bold text-surface-900 mb-3"
          style={{ fontFamily: invitation.designData?.headingFont || "Playfair Display" }}
        >
          {invitation.title}
        </h1>
        {invitation.description && (
          <p className="text-surface-600 max-w-xl mx-auto text-lg">
            {invitation.description}
          </p>
        )}
        <p className="text-surface-500 mt-3">Hosted by {invitation.hostName}</p>
      </motion.div>

      {/* Event Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 mb-1">When</h3>
                <p className="text-surface-600">
                  {formatEventDate(invitation.eventDate, invitation.eventTime)}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 mb-1">Where</h3>
                {invitation.location.virtual ? (
                  <div>
                    <p className="text-surface-600">Virtual Event</p>
                    {invitation.location.virtualLink && (
                      <a
                        href={invitation.location.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-600 hover:underline mt-1"
                      >
                        Join Online <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-surface-900 font-medium">{invitation.location.name}</p>
                    {invitation.location.address && (
                      <p className="text-surface-600">{invitation.location.address}</p>
                    )}
                    {invitation.location.city && (
                      <p className="text-surface-500">{invitation.location.city}</p>
                    )}
                    {invitation.location.mapUrl && (
                      <a
                        href={invitation.location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-600 hover:underline mt-2"
                      >
                        View on Map <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invitation Canvas Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div
          className="relative shadow-2xl rounded-2xl overflow-hidden"
          style={{
            width: "100%",
            maxWidth: `${Math.min(invitation.designData?.width || 800, 600)}px`,
            aspectRatio: `${invitation.designData?.width || 800} / ${invitation.designData?.height || 1120}`,
            backgroundColor: invitation.designData?.backgroundColor || "#FFFFFF",
          }}
        >
          {/* Render design elements */}
          {invitation.designData?.elements?.map((element) => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: `${(element.position.x / (invitation.designData?.width || 800)) * 100}%`,
                top: `${(element.position.y / (invitation.designData?.height || 1120)) * 100}%`,
                width: `${(element.size.width / (invitation.designData?.width || 800)) * 100}%`,
                height: `${(element.size.height / (invitation.designData?.height || 1120)) * 100}%`,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                opacity: element.opacity ?? 1,
                zIndex: element.zIndex,
              }}
            >
              {element.type === "text" && (
                <div
                  style={{
                    fontFamily: element.style.fontFamily,
                    fontSize: `${((element.style.fontSize || 16) / (invitation.designData?.width || 800)) * 100}vw`,
                    fontWeight: element.style.fontWeight,
                    color: element.style.color,
                    textAlign: element.style.textAlign,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {element.content}
                </div>
              )}
              {element.type === "shape" && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: element.style.backgroundColor,
                    borderRadius: element.style.borderRadius,
                  }}
                />
              )}
              {element.type === "divider" && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: element.style.backgroundColor || invitation.designData?.primaryColor,
                    borderRadius: "999px",
                  }}
                />
              )}
            </div>
          ))}

          {/* Fallback if no elements */}
          {(!invitation.designData?.elements || invitation.designData.elements.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <h2
                  className="text-2xl md:text-4xl font-bold mb-4"
                  style={{
                    fontFamily: invitation.designData?.headingFont || "Playfair Display",
                    color: invitation.designData?.primaryColor || "#FF6B47",
                  }}
                >
                  {invitation.title}
                </h2>
                <p className="text-surface-600">{invitation.description}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* RSVP Section */}
      {invitation.rsvpSettings.enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto text-center"
        >
          {isRsvpClosed ? (
            <div className="bg-surface-100 rounded-xl p-6">
              <Clock className="h-10 w-10 text-surface-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-surface-900 mb-1">RSVP Closed</h3>
              <p className="text-surface-600">The deadline for RSVPs has passed.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-surface-900 mb-2">
                Will you be attending?
              </h3>
              {invitation.rsvpSettings.deadline && (
                <p className="text-sm text-surface-500 mb-4">
                  Please respond by{" "}
                  {new Date(invitation.rsvpSettings.deadline).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
              <Link href={`/i/${shortId}/rsvp`}>
                <Button variant="primary" size="lg" className="w-full">
                  RSVP Now
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 pt-6 border-t border-surface-200"
      >
        <p className="text-sm text-surface-500">
          Powered by{" "}
          <Link href="/" className="text-brand-600 hover:underline font-medium">
            InviteGenerator
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
