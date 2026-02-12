"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  Calendar,
  Eye,
  Clock,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Share2,
  Users,
  Loader2,
  SortAsc,
  SortDesc,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyInvitations } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout";
import { cn, formatDate, formatRelativeDate, getDaysUntilEvent } from "@/lib/utils";
import { useInvitationStore } from "@/lib/stores";
import type { Invitation } from "@/types";

type ViewMode = "grid" | "list";
type SortField = "title" | "eventDate" | "updatedAt" | "viewCount";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "draft" | "published" | "archived";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function InvitationsPage() {
  const router = useRouter();
  const { invitations, fetchInvitations, deleteInvitation, isLoading } = useInvitationStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [sortField, setSortField] = React.useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  // Fetch invitations on mount
  React.useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Filter and sort invitations
  const filteredInvitations = React.useMemo(() => {
    let result = [...invitations];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.title.toLowerCase().includes(query) ||
          inv.eventType?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "eventDate":
          comparison = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "viewCount":
          comparison = (a.viewCount || 0) - (b.viewCount || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [invitations, searchQuery, statusFilter, sortField, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invitation? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteInvitation(id);
      toast.success("Invitation deleted");
    } catch (error) {
      toast.error("Failed to delete invitation");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDuplicate = async (invitation: Invitation) => {
    try {
      toast.info("Duplicating invitation...");
      const { duplicateInvitation } = useInvitationStore.getState();
      await duplicateInvitation(invitation.id);
      toast.success("Invitation duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate invitation");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (isLoading && invitations.length === 0) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <span className="ml-2 text-muted-foreground">Loading invitations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Invitations"
        description="Manage all your event invitations"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invitations" },
        ]}
        actions={
          <Link href="/dashboard/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invitation
            </Button>
          </Link>
        }
      />

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invitations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Last Updated</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="eventDate">Event Date</SelectItem>
            <SelectItem value="viewCount">Views</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={toggleSortOrder} aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}>
          {sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>

        {/* View Mode Toggle */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid" ? "true" : "false"}
            className={cn(
              "px-3 py-2 transition-colors",
              viewMode === "grid"
                ? "bg-brand-600 text-white"
                : "bg-white text-muted-foreground hover:bg-muted"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list" ? "true" : "false"}
            className={cn(
              "px-3 py-2 transition-colors",
              viewMode === "list"
                ? "bg-brand-600 text-white"
                : "bg-white text-muted-foreground hover:bg-muted"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredInvitations.length} of {invitations.length} invitations
      </div>

      {/* Empty State */}
      {filteredInvitations.length === 0 ? (
        searchQuery || statusFilter !== "all" ? (
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
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <EmptyInvitations
            onAction={() => router.push("/dashboard/create")}
          />
        )
      ) : viewMode === "grid" ? (
        /* Grid View */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              isDeleting={isDeleting === invitation.id}
            />
          ))}
        </motion.div>
      ) : (
        /* List View */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="overflow-hidden">
            <div className="divide-y">
              {filteredInvitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  isDeleting={isDeleting === invitation.id}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// Grid Card Component
interface InvitationItemProps {
  invitation: Invitation;
  onDelete: (id: string) => void;
  onDuplicate: (inv: Invitation) => void;
  isDeleting: boolean;
}

function InvitationCard({ invitation, onDelete, onDuplicate, isDeleting }: InvitationItemProps) {
  const daysUntil = getDaysUntilEvent(invitation.eventDate);

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        {/* Preview Area */}
        <div
          className="h-40 relative"
          style={{
            backgroundColor: invitation.designData?.backgroundColor || "#f3f4f6",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100/50 to-accent-100/50 flex items-center justify-center">
            <Mail className="h-12 w-12 text-brand-500/50" />
          </div>

          {/* Status Badge */}
          <Badge
            className="absolute top-3 left-3"
            variant={
              invitation.status === "published"
                ? "success"
                : invitation.status === "draft"
                ? "default"
                : "secondary"
            }
          >
            {invitation.status}
          </Badge>

          {/* Days Until Badge */}
          {daysUntil >= 0 && invitation.status === "published" && (
            <Badge
              className="absolute top-3 right-3"
              variant={daysUntil <= 7 ? "warning" : "secondary"}
            >
              {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
            </Badge>
          )}

          {/* Quick Actions on Hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Link href={`/dashboard/invitations/${invitation.id}/edit`}>
              <Button size="sm" variant="secondary">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            {invitation.status === "published" && invitation.shortId && (
              <a href={`/i/${invitation.shortId}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="secondary">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{invitation.title}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {invitation.eventType?.replace("_", " ") || "Event"}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0" aria-label="Invitation actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/invitations/${invitation.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Design
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/invitations/${invitation.id}/share`}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/invitations/${invitation.id}/guests`}>
                    <Users className="h-4 w-4 mr-2" />
                    Guests
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(invitation)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {invitation.status === "published" && invitation.shortId && (
                  <DropdownMenuItem asChild>
                    <a href={`/i/${invitation.shortId}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(invitation.id)}
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

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(invitation.eventDate, "MMM d")}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {invitation.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeDate(invitation.updatedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// List Row Component
function InvitationRow({ invitation, onDelete, onDuplicate, isDeleting }: InvitationItemProps) {
  const daysUntil = getDaysUntilEvent(invitation.eventDate);

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
    >
      {/* Thumbnail */}
      <div
        className="h-14 w-20 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: invitation.designData?.backgroundColor || "#f3f4f6",
        }}
      >
        <Mail className="h-6 w-6 text-brand-500/50" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate">{invitation.title}</h3>
          <Badge
            size="sm"
            variant={
              invitation.status === "published"
                ? "success"
                : invitation.status === "draft"
                ? "default"
                : "secondary"
            }
          >
            {invitation.status}
          </Badge>
          {daysUntil >= 0 && daysUntil <= 7 && invitation.status === "published" && (
            <Badge size="sm" variant="warning">
              {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="capitalize">{invitation.eventType?.replace("_", " ") || "Event"}</span>
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

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/invitations/${invitation.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <Link href={`/dashboard/invitations/${invitation.id}/share`}>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/invitations/${invitation.id}/guests`}>
                <Users className="h-4 w-4 mr-2" />
                Manage Guests
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(invitation)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            {invitation.status === "published" && invitation.shortId && (
              <DropdownMenuItem asChild>
                <a href={`/i/${invitation.shortId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(invitation.id)}
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
    </motion.div>
  );
}
