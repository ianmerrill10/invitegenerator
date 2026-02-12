"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LucideIcon, FileText, Users, Calendar, Mail, Image, FolderOpen, Search, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      {children}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 mt-4">
          {actionLabel && onAction && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
interface PresetEmptyStateProps {
  onAction?: () => void;
  className?: string;
}

export function EmptyInvitations({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={FileText}
      title="No invitations yet"
      description="Create your first invitation to get started. Design beautiful invitations and share them with your guests."
      actionLabel="Create Invitation"
      onAction={onAction}
      className={className}
    />
  );
}

export function EmptyGuests({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Users}
      title="No guests added"
      description="Add guests to track RSVPs and send personalized invitations."
      actionLabel="Add Guest"
      onAction={onAction}
      className={className}
    />
  );
}

export function EmptyRSVPs({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Mail}
      title="No RSVPs yet"
      description="Once you share your invitation, guest responses will appear here."
      className={className}
    />
  );
}

export function EmptyEvents({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Calendar}
      title="No upcoming events"
      description="You don't have any events scheduled. Create an invitation to add an event."
      actionLabel="Create Event"
      onAction={onAction}
      className={className}
    />
  );
}

export function EmptyMedia({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Image}
      title="No media uploaded"
      description="Upload images to use in your invitation designs."
      actionLabel="Upload Media"
      onAction={onAction}
      className={className}
    />
  );
}

export function EmptySearch({ query, className }: { query?: string; className?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try a different search term.`
          : "No results found. Try adjusting your filters."
      }
      className={className}
    />
  );
}

export function EmptyNotifications({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
      className={className}
    />
  );
}

// Generic data empty state
export function NoData({
  title = "No data available",
  description = "There's nothing to show here yet.",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      title={title}
      description={description}
      className={className}
    />
  );
}
