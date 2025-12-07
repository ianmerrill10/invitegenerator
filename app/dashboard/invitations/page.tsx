"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Eye,
  Calendar,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Share2,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import { useInvitationStore } from "@/lib/stores";
import type { Invitation, InvitationStatus, EventType } from "@/types";

const statusFilters: { value: InvitationStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const eventTypeFilters: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "corporate", label: "Corporate" },
  { value: "holiday", label: "Holiday" },
  { value: "other", label: "Other" },
];

export default function InvitationsPage() {
  const router = useRouter();
  const { invitations, fetchInvitations, deleteInvitation, duplicateInvitation, isLoading } =
    useInvitationStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<InvitationStatus | "all">("all");
  const [typeFilter, setTypeFilter] = React.useState<EventType | "all">("all");
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Filter invitations
  const filteredInvitations = React.useMemo(() => {
    return invitations.filter((inv) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !inv.title.toLowerCase().includes(query) &&
          !inv.hostName?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && inv.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && inv.eventType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [invitations, searchQuery, statusFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invitation?")) {
      try {
        await deleteInvitation(id);
        setActiveMenu(null);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newInvitation = await duplicateInvitation(id);
      setActiveMenu(null);
      router.push(`/dashboard/invitations/${newInvitation.id}/edit`);
    } catch (error) {
      console.error("Duplicate error:", error);
    }
  };

  const handleShare = (invitation: Invitation) => {
    if (invitation.shareUrl) {
      navigator.clipboard.writeText(invitation.shareUrl);
      alert("Link copied to clipboard!");
    }
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900">Invitations</h1>
          <p className="text-surface-600 mt-1">Manage all your invitations in one place</p>
        </div>
        <Link href="/dashboard/create">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Create New</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invitations..."
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
            rightIcon={<ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />}
          >
            Filters
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-surface-200"
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvitationStatus | "all")}
              className="px-4 py-2 border border-surface-300 rounded-lg bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EventType | "all")}
              className="px-4 py-2 border border-surface-300 rounded-lg bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {eventTypeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {(statusFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </Card>

      {/* Results count */}
      <p className="text-sm text-surface-500">
        Showing {filteredInvitations.length} of {invitations.length} invitations
      </p>

      {/* Invitations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="none" className="animate-pulse">
              <div className="h-40 bg-surface-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-200 rounded w-3/4" />
                <div className="h-4 bg-surface-200 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredInvitations.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="h-16 w-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-surface-400" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-surface-900 mb-2">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "No matching invitations"
              : "No invitations yet"}
          </h3>
          <p className="text-surface-500 mb-4">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first invitation to get started"}
          </p>
          {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
            <Link href="/dashboard/create">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Create Invitation</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvitations.map((invitation) => (
            <Card key={invitation.id} padding="none" variant="hover" className="overflow-hidden">
              {/* Preview */}
              <Link href={`/dashboard/invitations/${invitation.id}`}>
                <div
                  className="h-40 relative"
                  style={{
                    backgroundColor: invitation.designData?.backgroundColor || "#f5f5f5",
                    background: `linear-gradient(135deg, ${invitation.designData?.primaryColor || "#FF6B47"}22, ${invitation.designData?.secondaryColor || "#14B8A6"}22)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="h-12 w-12 text-brand-400 opacity-50" />
                  </div>
                  <div className="absolute top-3 right-3">
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
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/dashboard/invitations/${invitation.id}`} className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-surface-900 truncate hover:text-brand-600 transition-colors">
                      {invitation.title}
                    </h3>
                  </Link>

                  {/* Actions Menu */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setActiveMenu(activeMenu === invitation.id ? null : invitation.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>

                    {activeMenu === invitation.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-elevated border border-surface-200 py-1 z-20">
                          <Link
                            href={`/dashboard/invitations/${invitation.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100"
                            onClick={() => setActiveMenu(null)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Design
                          </Link>
                          <button
                            onClick={() => handleDuplicate(invitation.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-100"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          {invitation.status === "published" && (
                            <>
                              <button
                                onClick={() => handleShare(invitation)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-100"
                              >
                                <Share2 className="h-4 w-4" />
                                Copy Link
                              </button>
                              <a
                                href={invitation.shareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100"
                                onClick={() => setActiveMenu(null)}
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Live
                              </a>
                            </>
                          )}
                          <hr className="my-1 border-surface-200" />
                          <button
                            onClick={() => handleDelete(invitation.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-600 hover:bg-error-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Meta info */}
                <div className="mt-3 space-y-2 text-sm text-surface-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(invitation.eventDate, "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {invitation.viewCount || 0}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400">
                    Updated {formatRelativeDate(invitation.updatedAt)}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-3 border-t border-surface-100 flex gap-2">
                  <Link href={`/dashboard/invitations/${invitation.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/invitations/${invitation.id}/edit`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
