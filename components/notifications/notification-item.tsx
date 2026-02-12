"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Mail,
  UserCheck,
  UserX,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";

export type NotificationType =
  | "rsvp_attending"
  | "rsvp_declined"
  | "rsvp_maybe"
  | "invitation_sent"
  | "invitation_viewed"
  | "event_reminder"
  | "system"
  | "success"
  | "error"
  | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

const iconMap: Record<NotificationType, React.ElementType> = {
  rsvp_attending: UserCheck,
  rsvp_declined: UserX,
  rsvp_maybe: Bell,
  invitation_sent: Mail,
  invitation_viewed: Mail,
  event_reminder: Calendar,
  system: Bell,
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<NotificationType, string> = {
  rsvp_attending: "text-success bg-success/10",
  rsvp_declined: "text-destructive bg-destructive/10",
  rsvp_maybe: "text-warning bg-warning/10",
  invitation_sent: "text-primary bg-primary/10",
  invitation_viewed: "text-primary bg-primary/10",
  event_reminder: "text-warning bg-warning/10",
  system: "text-muted-foreground bg-surface-100",
  success: "text-success bg-success/10",
  error: "text-destructive bg-destructive/10",
  info: "text-primary bg-primary/10",
};

export const NotificationItem = memo(function NotificationItem({
  notification,
  onRead,
  onDismiss,
  onClick,
  compact = false,
  className,
}: NotificationItemProps) {
  const Icon = iconMap[notification.type] || Bell;
  const iconColors = colorMap[notification.type] || colorMap.system;

  const handleClick = useCallback(() => {
    if (!notification.read && onRead) {
      onRead(notification.id);
    }
    onClick?.();
  }, [notification.read, notification.id, onRead, onClick]);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.(notification.id);
  }, [onDismiss, notification.id]);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
          notification.read
            ? "bg-transparent hover:bg-surface-50 dark:hover:bg-surface-900"
            : "bg-primary/5 hover:bg-primary/10",
          className
        )}
        onClick={handleClick}
      >
        <div className={cn("p-1.5 rounded-full shrink-0", iconColors)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm truncate",
              !notification.read && "font-medium"
            )}
          >
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
        notification.read
          ? "bg-surface-50/50 dark:bg-surface-900/50"
          : "bg-white dark:bg-surface-900 border-primary/20",
        onClick && "cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800",
        className
      )}
      onClick={handleClick}
    >
      <div className={cn("p-2 rounded-full shrink-0", iconColors)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={cn("text-sm", !notification.read && "font-semibold")}
            >
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {notification.message}
            </p>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
              aria-label={`Dismiss notification: ${notification.title}`}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>

      {!notification.read && !onDismiss && (
        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
      )}
    </div>
  );
});

// Skeleton for loading state
export function NotificationItemSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-3 p-3">
        <div className="w-7 h-7 rounded-full bg-surface-200 dark:bg-surface-800 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border">
      <div className="w-9 h-9 rounded-full bg-surface-200 dark:bg-surface-800 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
        <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
        <div className="h-3 w-24 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
      </div>
    </div>
  );
}
