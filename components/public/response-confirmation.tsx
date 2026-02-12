"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AddToCalendar } from "@/components/invitation/add-to-calendar";
import type { CalendarEvent } from "@/components/invitation/add-to-calendar";
import {
  Check,
  X,
  HelpCircle,
  Calendar,
  MapPin,
  Mail,
  Edit,
  Share2,
} from "lucide-react";
import { format } from "date-fns";

type ResponseType = "attending" | "not_attending" | "maybe";

interface ResponseConfirmationProps {
  response: ResponseType;
  eventTitle: string;
  eventDate: Date;
  eventEndDate?: Date;
  eventLocation?: string;
  guestName: string;
  guestCount?: number;
  onChangeResponse?: () => void;
  onShare?: () => void;
  className?: string;
}

const responseConfig = {
  attending: {
    icon: Check,
    title: "You're Going!",
    subtitle: "We look forward to seeing you",
    color: "success",
    bgClass: "bg-success/10",
  },
  not_attending: {
    icon: X,
    title: "We'll Miss You",
    subtitle: "Thanks for letting us know",
    color: "destructive",
    bgClass: "bg-destructive/10",
  },
  maybe: {
    icon: HelpCircle,
    title: "Maybe Attending",
    subtitle: "We hope you can make it",
    color: "warning",
    bgClass: "bg-warning/10",
  },
};

export function ResponseConfirmation({
  response,
  eventTitle,
  eventDate,
  eventEndDate,
  eventLocation,
  guestName,
  guestCount = 1,
  onChangeResponse,
  onShare,
  className,
}: ResponseConfirmationProps) {
  const config = responseConfig[response];
  const Icon = config.icon;

  const calendarEvent: CalendarEvent = {
    title: eventTitle,
    startDate: eventDate,
    endDate: eventEndDate,
    location: eventLocation,
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="pt-8 pb-6 text-center">
        {/* Status Icon */}
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
            config.bgClass
          )}
        >
          <Icon className={cn("h-10 w-10", `text-${config.color}`)} />
        </div>

        {/* Status Text */}
        <h2 className="text-2xl font-bold mb-1">{config.title}</h2>
        <p className="text-muted-foreground mb-6">{config.subtitle}</p>

        {/* Response Details */}
        <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-4 mb-4 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">{guestName}</span>
                {response === "attending" && guestCount > 1 && (
                  <span className="text-muted-foreground">
                    {" "}
                    + {guestCount - 1} guest{guestCount > 2 ? "s" : ""}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(eventDate, "EEEE, MMMM d, yyyy")} at{" "}
                {format(eventDate, "h:mm a")}
              </span>
            </div>
            {eventLocation && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{eventLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions for attending */}
        {response === "attending" && (
          <div className="flex gap-2 justify-center">
            <AddToCalendar event={calendarEvent} />
            {onShare && (
              <Button variant="outline" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {onChangeResponse && (
        <CardFooter className="border-t bg-surface-50 dark:bg-surface-900 py-3">
          <Button
            variant="ghost"
            onClick={onChangeResponse}
            className="w-full text-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Change Response
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Mini confirmation for toast/notification
interface MiniConfirmationProps {
  response: ResponseType;
  eventTitle: string;
  className?: string;
}

export function MiniConfirmation({
  response,
  eventTitle,
  className,
}: MiniConfirmationProps) {
  const config = responseConfig[response];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          config.bgClass
        )}
      >
        <Icon className={cn("h-5 w-5", `text-${config.color}`)} />
      </div>
      <div>
        <p className="font-medium">{config.title}</p>
        <p className="text-sm text-muted-foreground truncate">{eventTitle}</p>
      </div>
    </div>
  );
}
