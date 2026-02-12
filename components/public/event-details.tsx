"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCalendar } from "@/components/invitation/add-to-calendar";
import type { CalendarEvent } from "@/components/invitation/add-to-calendar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Info,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface EventDetailsProps {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  location?: string;
  locationUrl?: string;
  dresscode?: string;
  capacity?: number;
  currentRsvps?: number;
  additionalInfo?: string[];
  className?: string;
}

export function EventDetails({
  title,
  description,
  date,
  endDate,
  location,
  locationUrl,
  dresscode,
  capacity,
  currentRsvps,
  additionalInfo,
  className,
}: EventDetailsProps) {
  const calendarEvent: CalendarEvent = {
    title,
    description,
    location,
    startDate: date,
    endDate,
  };

  const spotsRemaining = capacity ? capacity - (currentRsvps || 0) : null;
  const isAlmostFull = spotsRemaining !== null && spotsRemaining <= 5;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {spotsRemaining !== null && (
            <Badge variant={isAlmostFull ? "error" : "secondary"}>
              {spotsRemaining > 0 ? `${spotsRemaining} spots left` : "Full"}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(date, "h:mm a")}
                {endDate && ` - ${format(endDate, "h:mm a")}`}
              </span>
            </div>
          </div>
          <AddToCalendar event={calendarEvent} className="shrink-0" />
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{location}</p>
              {locationUrl && (
                <a
                  href={locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  View on map
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Dresscode */}
        {dresscode && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Dress Code</p>
              <p className="text-sm text-muted-foreground">{dresscode}</p>
            </div>
          </div>
        )}

        {/* Capacity */}
        {capacity && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Capacity</p>
              <p className="text-sm text-muted-foreground">
                {currentRsvps || 0} of {capacity} attending
              </p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {additionalInfo && additionalInfo.length > 0 && (
          <div className="pt-3 border-t">
            <p className="font-medium text-sm mb-2">Additional Information</p>
            <ul className="space-y-1">
              {additionalInfo.map((info, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-1">•</span>
                  {info}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact event details for cards/lists
interface EventDetailsCompactProps {
  date: Date;
  location?: string;
  className?: string;
}

export function EventDetailsCompact({
  date,
  location,
  className,
}: EventDetailsCompactProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{format(date, "MMM d, yyyy")}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>{format(date, "h:mm a")}</span>
      </div>
      {location && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{location}</span>
        </div>
      )}
    </div>
  );
}
