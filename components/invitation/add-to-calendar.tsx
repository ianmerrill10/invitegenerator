"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown } from "lucide-react";

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}

interface AddToCalendarProps {
  event: CalendarEvent;
  className?: string;
}

// Format date for different calendar services
function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d{3}/g, "");
}

function formatDateForOutlook(date: Date): string {
  return date.toISOString();
}

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d{3}/g, "").slice(0, -1);
}

export function AddToCalendar({ event, className }: AddToCalendarProps) {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  const generateGoogleCalendarUrl = (): string => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(endDate)}`,
      details: event.description || "",
      location: event.location || "",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookUrl = (): string => {
    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: event.title,
      startdt: formatDateForOutlook(event.startDate),
      enddt: formatDateForOutlook(endDate),
      body: event.description || "",
      location: event.location || "",
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateYahooUrl = (): string => {
    const params = new URLSearchParams({
      v: "60",
      title: event.title,
      st: formatDateForGoogle(event.startDate),
      et: formatDateForGoogle(endDate),
      desc: event.description || "",
      in_loc: event.location || "",
    });
    return `https://calendar.yahoo.com/?${params.toString()}`;
  };

  const generateICSContent = (): string => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//InviteGenerator//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `DTSTART:${formatDateForICS(event.startDate)}Z`,
      `DTEND:${formatDateForICS(endDate)}Z`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description?.replace(/\n/g, "\\n") || ""}`,
      `LOCATION:${event.location || ""}`,
      `UID:${Date.now()}@invitegenerator.com`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return icsContent;
  };

  const downloadICS = () => {
    const content = generateICSContent();
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCalendarClick = (type: string) => {
    switch (type) {
      case "google":
        window.open(generateGoogleCalendarUrl(), "_blank");
        break;
      case "outlook":
        window.open(generateOutlookUrl(), "_blank");
        break;
      case "yahoo":
        window.open(generateYahooUrl(), "_blank");
        break;
      case "ics":
        downloadICS();
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleCalendarClick("google")}>
          <span className="flex items-center gap-2">
            <GoogleCalendarIcon />
            Google Calendar
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCalendarClick("outlook")}>
          <span className="flex items-center gap-2">
            <OutlookIcon />
            Outlook
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCalendarClick("yahoo")}>
          <span className="flex items-center gap-2">
            <YahooIcon />
            Yahoo Calendar
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCalendarClick("ics")}>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Download .ics
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple icon components
function GoogleCalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M18.316 5.684H5.684v12.632h12.632V5.684z" fill="#fff"/>
      <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-2.184 2.684v12.632H5.684V5.684h12.632z" fill="#4285F4"/>
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#0078D4">
      <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.157.152-.355.228-.593.228h-8.17v-6.522l1.903 1.903.53-.53-2.98-2.98-2.982 2.98.53.53 1.904-1.903v6.522H1.831a.796.796 0 01-.593-.228.751.751 0 01-.238-.576V7.387l11 6.463 11-6.463z"/>
      <path d="M23.992 5.14a.764.764 0 00-.03-.128l-.003-.01a.756.756 0 00-.057-.117c-.003-.006-.008-.012-.012-.018a.736.736 0 00-.083-.103l-.009-.01a.756.756 0 00-.105-.087l-.006-.004a.743.743 0 00-.12-.064l-.013-.005a.758.758 0 00-.125-.03l-.007-.001A.755.755 0 0023.169 4.5H.831c-.057 0-.113.006-.168.018l-.007.001a.758.758 0 00-.125.03l-.013.005a.743.743 0 00-.12.064l-.006.004a.756.756 0 00-.105.087l-.009.01a.736.736 0 00-.083.103c-.004.006-.009.012-.012.018a.756.756 0 00-.057.117l-.003.01a.764.764 0 00-.03.128L0 5.185v.627l12 7.055 12-7.055V5.185l-.008-.045z"/>
    </svg>
  );
}

function YahooIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#6001D2">
      <path d="M12.757 18.854l-.918 3.146h-2.48l.804-3.146-3.975-11.854h2.744l2.47 8.314 2.52-8.314h2.65l-3.815 11.854z"/>
      <circle cx="11.328" cy="22" r="1.5"/>
    </svg>
  );
}

// Calendar link generator utility
export function generateCalendarLinks(event: CalendarEvent) {
  const endDate = event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);

  return {
    google: (() => {
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(endDate)}`,
        details: event.description || "",
        location: event.location || "",
      });
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    })(),
    outlook: (() => {
      const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: event.title,
        startdt: formatDateForOutlook(event.startDate),
        enddt: formatDateForOutlook(endDate),
        body: event.description || "",
        location: event.location || "",
      });
      return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    })(),
    yahoo: (() => {
      const params = new URLSearchParams({
        v: "60",
        title: event.title,
        st: formatDateForGoogle(event.startDate),
        et: formatDateForGoogle(endDate),
        desc: event.description || "",
        in_loc: event.location || "",
      });
      return `https://calendar.yahoo.com/?${params.toString()}`;
    })(),
  };
}
