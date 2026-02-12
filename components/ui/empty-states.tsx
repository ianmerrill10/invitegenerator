"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  Mail,
  Image,
  Calendar,
  CreditCard,
  Bell,
  Search,
  Inbox,
  FolderOpen,
  Plus,
} from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "compact" | "card";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";
  const isCard = variant === "card";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-8 px-4" : "py-16 px-6",
        isCard && "bg-card rounded-lg border p-8",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "rounded-full bg-muted flex items-center justify-center mb-4",
            isCompact ? "h-12 w-12" : "h-16 w-16"
          )}
        >
          <span className={cn("text-muted-foreground", isCompact ? "" : "scale-125")}>
            {icon}
          </span>
        </div>
      )}

      <h3
        className={cn(
          "font-semibold text-foreground",
          isCompact ? "text-base" : "text-lg"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-md",
            isCompact ? "text-sm mt-1" : "mt-2"
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className={cn("flex gap-3", isCompact ? "mt-4" : "mt-6")}>
          {action && (
            <Button onClick={action.onClick}>
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common use cases

export function NoInvitationsEmptyState({
  onCreateNew,
}: {
  onCreateNew: () => void;
}) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8" />}
      title="No invitations yet"
      description="Create your first invitation to get started. Choose from our beautiful templates or start from scratch."
      action={{
        label: "Create Invitation",
        onClick: onCreateNew,
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );
}

export function NoGuestsEmptyState({
  onAddGuests,
}: {
  onAddGuests: () => void;
}) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8" />}
      title="No guests added"
      description="Add guests to track RSVPs and send invitations. You can add them one by one or import from a CSV file."
      action={{
        label: "Add Guests",
        onClick: onAddGuests,
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );
}

export function NoRSVPsEmptyState() {
  return (
    <EmptyState
      icon={<Mail className="h-8 w-8" />}
      title="No RSVPs yet"
      description="Share your invitation to start receiving RSVPs. Guests will appear here once they respond."
    />
  );
}

export function NoTemplatesEmptyState({
  onBrowseTemplates,
}: {
  onBrowseTemplates: () => void;
}) {
  return (
    <EmptyState
      icon={<Image className="h-8 w-8" />}
      title="No templates found"
      description="Try adjusting your filters or browse all available templates."
      action={{
        label: "Browse All Templates",
        onClick: onBrowseTemplates,
      }}
    />
  );
}

export function NoEventsEmptyState({
  onCreateEvent,
}: {
  onCreateEvent: () => void;
}) {
  return (
    <EmptyState
      icon={<Calendar className="h-8 w-8" />}
      title="No upcoming events"
      description="You don't have any upcoming events. Create an invitation to plan your next event."
      action={{
        label: "Plan an Event",
        onClick: onCreateEvent,
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );
}

export function NoPaymentHistoryEmptyState() {
  return (
    <EmptyState
      icon={<CreditCard className="h-8 w-8" />}
      title="No payment history"
      description="Your payment history will appear here once you make your first purchase."
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={<Bell className="h-8 w-8" />}
      title="All caught up!"
      description="You don't have any notifications. We'll notify you when something important happens."
      variant="compact"
    />
  );
}

export function NoSearchResultsEmptyState({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
      }}
    />
  );
}

export function NoMessagesEmptyState() {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8" />}
      title="No messages"
      description="Your inbox is empty. Messages from guests will appear here."
    />
  );
}

export function NoArchivedEmptyState() {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8" />}
      title="No archived items"
      description="Items you archive will appear here. Archived items can be restored at any time."
      variant="compact"
    />
  );
}

export function GenericEmptyState({
  itemType,
  onAction,
  actionLabel,
}: {
  itemType: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8" />}
      title={`No ${itemType} found`}
      description={`There are no ${itemType} to display at this time.`}
      action={
        onAction && actionLabel
          ? {
              label: actionLabel,
              onClick: onAction,
            }
          : undefined
      }
    />
  );
}

export default EmptyState;
