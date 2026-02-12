"use client";

import { toast, Toaster as SonnerToaster } from "sonner";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  UserCheck,
  Mail,
  Calendar,
} from "lucide-react";
import type { NotificationType } from "./notification-item";

// Re-export the Toaster component
export { SonnerToaster as NotificationToaster };

// Toast configuration by type
const toastConfig: Record<
  NotificationType,
  { icon: React.ElementType; className: string }
> = {
  rsvp_attending: { icon: UserCheck, className: "text-success" },
  rsvp_declined: { icon: XCircle, className: "text-destructive" },
  rsvp_maybe: { icon: AlertCircle, className: "text-warning" },
  invitation_sent: { icon: Mail, className: "text-primary" },
  invitation_viewed: { icon: Mail, className: "text-primary" },
  event_reminder: { icon: Calendar, className: "text-warning" },
  system: { icon: Info, className: "text-muted-foreground" },
  success: { icon: CheckCircle, className: "text-success" },
  error: { icon: XCircle, className: "text-destructive" },
  info: { icon: Info, className: "text-primary" },
};

// Custom toast functions
export const notify = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      icon: <CheckCircle className="h-5 w-5 text-success" />,
    });
  },

  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      icon: <XCircle className="h-5 w-5 text-destructive" />,
    });
  },

  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: <AlertCircle className="h-5 w-5 text-warning" />,
    });
  },

  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: <Info className="h-5 w-5 text-primary" />,
    });
  },

  rsvp: (
    guestName: string,
    response: "attending" | "not_attending" | "maybe",
    eventTitle?: string
  ) => {
    const messages = {
      attending: {
        title: `${guestName} is attending!`,
        icon: <UserCheck className="h-5 w-5 text-success" />,
      },
      not_attending: {
        title: `${guestName} can't attend`,
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      },
      maybe: {
        title: `${guestName} might attend`,
        icon: <AlertCircle className="h-5 w-5 text-warning" />,
      },
    };

    const config = messages[response];
    toast(config.title, {
      description: eventTitle,
      icon: config.icon,
    });
  },

  invitation: (action: "sent" | "viewed", recipientName: string) => {
    const messages = {
      sent: {
        title: "Invitation Sent",
        description: `Your invitation was sent to ${recipientName}`,
      },
      viewed: {
        title: "Invitation Viewed",
        description: `${recipientName} viewed your invitation`,
      },
    };

    const config = messages[action];
    toast(config.title, {
      description: config.description,
      icon: <Mail className="h-5 w-5 text-primary" />,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  custom: (
    type: NotificationType,
    title: string,
    description?: string
  ) => {
    const config = toastConfig[type];
    const Icon = config.icon;

    toast(title, {
      description,
      icon: <Icon className={cn("h-5 w-5", config.className)} />,
    });
  },
};

// Toaster with custom styling
interface NotificationToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
}

export function NotificationToasterStyled({
  position = "bottom-right",
  expand = false,
  richColors = true,
  closeButton = true,
}: NotificationToasterProps) {
  return (
    <SonnerToaster
      position={position}
      expand={expand}
      richColors={richColors}
      closeButton={closeButton}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:bg-background group-[.toast]:border-border",
        },
      }}
    />
  );
}
