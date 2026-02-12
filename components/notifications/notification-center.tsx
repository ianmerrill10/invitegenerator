"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NotificationItem,
  NotificationItemSkeleton,
  type Notification,
} from "./notification-item";
import { Bell, Check, Settings, Inbox } from "lucide-react";

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount?: number;
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function NotificationCenter({
  notifications,
  unreadCount,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onNotificationClick,
  onSettingsClick,
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const count = unreadCount ?? notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    tab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleNotificationClick = (notification: Notification) => {
    onMarkAsRead?.(notification.id);
    onNotificationClick?.(notification);
    if (notification.link) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-destructive rounded-full" aria-hidden="true">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            {count > 0 && onMarkAllAsRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={onMarkAllAsRead}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onSettingsClick}
                aria-label="Notification settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Unread ({count})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={filteredNotifications}
              loading={loading}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
              onClick={handleNotificationClick}
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={filteredNotifications}
              loading={loading}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
              onClick={handleNotificationClick}
              emptyMessage="No unread notifications"
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

// Internal notification list component
interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClick?: (notification: Notification) => void;
  emptyMessage?: string;
}

function NotificationList({
  notifications,
  loading,
  onMarkAsRead,
  onDismiss,
  onClick,
  emptyMessage = "No notifications yet",
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="max-h-96 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <NotificationItemSkeleton key={i} compact />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto divide-y" aria-live="polite" aria-label="Notification list">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onMarkAsRead}
          onDismiss={onDismiss}
          onClick={() => onClick?.(notification)}
          compact
        />
      ))}
    </div>
  );
}

// Notification bell with count only (no dropdown)
interface NotificationBellProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({
  count,
  onClick,
  className,
}: NotificationBellProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("relative", className)}
      aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-destructive rounded-full" aria-hidden="true">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}
