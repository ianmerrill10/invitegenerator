"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Share2,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Mail,
  Trash2,
  Globe,
  QrCode,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import { useInvitationStore } from "@/lib/stores";
import type { Invitation } from "@/types";

export default function InvitationViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    currentInvitation,
    fetchInvitation,
    publishInvitation,
    unpublishInvitation,
    deleteInvitation,
    isLoading,
    rsvpResponses,
    rsvpSummary,
    fetchRSVPResponses,
  } = useInvitationStore();

  const [showShareModal, setShowShareModal] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchInvitation(id);
      fetchRSVPResponses(id);
    }
  }, [id, fetchInvitation, fetchRSVPResponses]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishInvitation(id);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (confirm("Are you sure? The public link will stop working.")) {
      await unpublishInvitation(id);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this invitation? This cannot be undone.")) {
      await deleteInvitation(id);
      router.push("/dashboard/invitations");
    }
  };

  const copyShareLink = () => {
    if (currentInvitation?.shareUrl) {
      navigator.clipboard.writeText(currentInvitation.shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading || !currentInvitation) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-200 rounded animate-pulse" />
        <div className="h-64 bg-surface-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const invitation = currentInvitation;
  const isPublished = invitation.status === "published";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invitations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-surface-900">
                {invitation.title}
              </h1>
              <Badge
                variant={
                  invitation.status === "published"
                    ? "success"
                    : invitation.status === "draft"
                    ? "default"
                    : "warning"
                }
              >
                {invitation.status}
              </Badge>
            </div>
            <p className="text-surface-500 mt-1">
              Created {formatRelativeDate(invitation.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPublished ? (
            <>
              <Button variant="outline" onClick={() => setShowShareModal(true)} leftIcon={<Share2 className="h-4 w-4" />}>
                Share
              </Button>
              <Button variant="outline" onClick={handleUnpublish}>
                Unpublish
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={handlePublish}
              disabled={publishing}
              leftIcon={<Globe className="h-4 w-4" />}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          )}
          <Link href={`/dashboard/invitations/${id}/edit`}>
            <Button leftIcon={<Edit className="h-4 w-4" />}>Edit Design</Button>
          </Link>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-heading font-semibold mb-4">Share Invitation</h2>

            <div className="space-y-4">
              {/* Share Link */}
              <div>
                <label className="text-sm font-medium text-surface-700 mb-2 block">
                  Public Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invitation.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-lg bg-surface-50 text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={copyShareLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <label className="text-sm font-medium text-surface-700 mb-2 block">
                  QR Code
                </label>
                <div className="flex items-center justify-center p-4 bg-surface-50 rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invitation.shareUrl)}`}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
              </div>

              {/* View Live */}
              <a
                href={invitation.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Live Invitation
              </a>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 w-full px-4 py-2 text-surface-600 hover:text-surface-900"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Card */}
          <Card padding="none">
            <div
              className="aspect-[3/4] max-h-[600px] relative rounded-t-xl overflow-hidden"
              style={{
                backgroundColor: invitation.designData?.backgroundColor || "#ffffff",
                background: `linear-gradient(135deg, ${invitation.designData?.primaryColor || "#FF6B47"}22, ${invitation.designData?.secondaryColor || "#14B8A6"}22)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Mail className="h-16 w-16 text-brand-400 mx-auto mb-4 opacity-50" />
                  <p className="text-surface-500">Invitation Preview</p>
                  <Link href={`/dashboard/invitations/${id}/edit`}>
                    <Button variant="outline" size="sm" className="mt-4">
                      Edit Design
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-brand-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-surface-900">Date</p>
                    <p className="text-surface-600">
                      {formatDate(invitation.eventDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {invitation.eventTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-brand-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-surface-900">Time</p>
                      <p className="text-surface-600">{invitation.eventTime}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="h-5 w-5 text-brand-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-surface-900">Location</p>
                    <p className="text-surface-600">
                      {invitation.location?.name}
                      {invitation.location?.address && (
                        <span className="block text-sm">
                          {invitation.location.address}
                          {invitation.location.city && `, ${invitation.location.city}`}
                        </span>
                      )}
                    </p>
                    {invitation.location?.mapUrl && (
                      <a
                        href={invitation.location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-600 hover:underline mt-1 inline-block"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {invitation.description && (
                <div className="pt-4 border-t border-surface-200">
                  <p className="font-medium text-surface-900 mb-2">Description</p>
                  <p className="text-surface-600">{invitation.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-surface-600">
                  <Eye className="h-4 w-4" />
                  <span>Views</span>
                </div>
                <span className="font-semibold text-surface-900">{invitation.viewCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-surface-600">
                  <Users className="h-4 w-4" />
                  <span>RSVPs</span>
                </div>
                <span className="font-semibold text-surface-900">{rsvpSummary?.total || 0}</span>
              </div>
              {rsvpSummary && rsvpSummary.total > 0 && (
                <div className="pt-3 border-t border-surface-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-success-600">Attending</span>
                    <span>{rsvpSummary.attending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-error-600">Not Attending</span>
                    <span>{rsvpSummary.notAttending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warning-600">Maybe</span>
                    <span>{rsvpSummary.maybe}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-surface-100 font-medium">
                    <span>Total Guests</span>
                    <span>{rsvpSummary.totalGuests}</span>
                  </div>
                </div>
              )}
              <Link href={`/dashboard/rsvp/${id}`} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  View All RSVPs
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* RSVP Settings */}
          <Card>
            <CardHeader>
              <CardTitle>RSVP Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-600">RSVP Enabled</span>
                <Badge variant={invitation.rsvpSettings?.enabled ? "success" : "default"}>
                  {invitation.rsvpSettings?.enabled ? "Yes" : "No"}
                </Badge>
              </div>
              {invitation.rsvpSettings?.deadline && (
                <div className="flex justify-between">
                  <span className="text-surface-600">Deadline</span>
                  <span>{formatDate(invitation.rsvpSettings.deadline, "MMM d, yyyy")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-surface-600">Max Guests</span>
                <span>{invitation.rsvpSettings?.maxGuests || "Unlimited"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Plus Ones</span>
                <span>{invitation.rsvpSettings?.allowPlusOne ? "Allowed" : "Not Allowed"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-error-200">
            <CardHeader>
              <CardTitle className="text-error-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full text-error-600 border-error-300 hover:bg-error-50"
                onClick={handleDelete}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete Invitation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
