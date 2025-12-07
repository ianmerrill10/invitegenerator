"use client";

import { useState } from "react";
import { Search, Download, UserCheck, UserX, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import type { RSVPResponse } from "@/types";

interface GuestListProps {
  responses: RSVPResponse[];
  onExport?: (format: "csv" | "xlsx") => void;
  isLoading?: boolean;
}

export function GuestList({ responses, onExport, isLoading }: GuestListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "attending" | "not_attending" | "maybe">("all");

  // Filter responses
  const filteredResponses = responses.filter((rsvp) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !rsvp.guestName.toLowerCase().includes(query) &&
        !rsvp.guestEmail.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (filter !== "all" && rsvp.response !== filter) {
      return false;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: responses.length,
    attending: responses.filter((r) => r.response === "attending").length,
    notAttending: responses.filter((r) => r.response === "not_attending").length,
    maybe: responses.filter((r) => r.response === "maybe").length,
    totalGuests: responses
      .filter((r) => r.response === "attending")
      .reduce((sum, r) => sum + (r.guestCount || 1), 0),
  };

  const getResponseBadge = (response: RSVPResponse["response"]) => {
    switch (response) {
      case "attending":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> Attending
          </Badge>
        );
      case "not_attending":
        return (
          <Badge variant="error" className="flex items-center gap-1">
            <UserX className="h-3 w-3" /> Not Attending
          </Badge>
        );
      case "maybe":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <HelpCircle className="h-3 w-3" /> Maybe
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-surface-200 rounded" />
          <div className="h-64 bg-surface-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-surface-900">{stats.total}</p>
          <p className="text-sm text-surface-500">Total</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-success-600">{stats.attending}</p>
          <p className="text-sm text-surface-500">Attending</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-error-600">{stats.notAttending}</p>
          <p className="text-sm text-surface-500">Not Attending</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-warning-600">{stats.maybe}</p>
          <p className="text-sm text-surface-500">Maybe</p>
        </Card>
        <Card padding="sm" className="text-center bg-brand-50">
          <p className="text-2xl font-bold text-brand-600">{stats.totalGuests}</p>
          <p className="text-sm text-surface-500">Total Guests</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-surface-300 rounded-lg bg-white"
          >
            <option value="all">All Responses</option>
            <option value="attending">Attending</option>
            <option value="not_attending">Not Attending</option>
            <option value="maybe">Maybe</option>
          </select>

          {onExport && (
            <Button variant="outline" onClick={() => onExport("csv")} leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
          )}
        </div>
      </Card>

      {/* Guest Table */}
      <Card padding="none">
        {filteredResponses.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            {responses.length === 0
              ? "No RSVP responses yet"
              : "No matching responses found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                    Response
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {filteredResponses.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-surface-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-surface-900">{rsvp.guestName}</p>
                        <p className="text-sm text-surface-500">{rsvp.guestEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getResponseBadge(rsvp.response)}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{rsvp.guestCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-surface-500">
                        {formatDate(rsvp.submittedAt, "MMM d, h:mm a")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
