"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  HelpCircle,
  Mail,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { useInvitationStore } from "@/lib/stores";
import type { RSVPResponse } from "@/types";

export default function RSVPManagementPage() {
  const params = useParams();
  const invitationId = params.invitationId as string;

  const {
    currentInvitation,
    fetchInvitation,
    rsvpResponses,
    rsvpSummary,
    fetchRSVPResponses,
    exportRSVPResponses,
    isLoading,
  } = useInvitationStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "yes" | "no" | "maybe">("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    if (invitationId) {
      fetchInvitation(invitationId);
      fetchRSVPResponses(invitationId);
    }
  }, [invitationId, fetchInvitation, fetchRSVPResponses]);

  // Filter responses
  const filteredResponses = React.useMemo(() => {
    return rsvpResponses.filter((rsvp) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !rsvp.guestName.toLowerCase().includes(query) &&
          !rsvp.guestEmail.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (statusFilter !== "all") {
        const responseMap: Record<string, string> = {
          yes: "attending",
          no: "not_attending",
          maybe: "maybe",
        };
        if (rsvp.response !== responseMap[statusFilter]) {
          return false;
        }
      }
      return true;
    });
  }, [rsvpResponses, searchQuery, statusFilter]);

  const handleExport = async (format: "csv" | "xlsx") => {
    setExporting(true);
    try {
      await exportRSVPResponses(invitationId, format);
    } finally {
      setExporting(false);
    }
  };

  const getResponseBadge = (response: RSVPResponse["response"]) => {
    switch (response) {
      case "attending":
        return <Badge variant="success">Attending</Badge>;
      case "not_attending":
        return <Badge variant="error">Not Attending</Badge>;
      case "maybe":
        return <Badge variant="warning">Maybe</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-surface-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/invitations/${invitationId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-surface-900">
              RSVP Responses
            </h1>
            {currentInvitation && (
              <p className="text-surface-500">{currentInvitation.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={exporting || rsvpResponses.length === 0}
            leftIcon={<Download className="h-4 w-4" />}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-surface-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{rsvpSummary?.total || 0}</p>
              <p className="text-sm text-surface-500">Total Responses</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success-600">{rsvpSummary?.attending || 0}</p>
              <p className="text-sm text-surface-500">Attending</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-error-100 flex items-center justify-center">
              <UserX className="h-5 w-5 text-error-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-error-600">{rsvpSummary?.notAttending || 0}</p>
              <p className="text-sm text-surface-500">Not Attending</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-600">{rsvpSummary?.maybe || 0}</p>
              <p className="text-sm text-surface-500">Maybe</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Total Guests Banner */}
      {rsvpSummary && rsvpSummary.totalGuests > 0 && (
        <Card padding="md" className="bg-brand-50 border-brand-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-brand-600" />
              <div>
                <p className="font-semibold text-brand-900">Expected Guests</p>
                <p className="text-sm text-brand-600">Including plus ones</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-600">{rsvpSummary.totalGuests}</p>
          </div>
        </Card>
      )}

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border border-surface-300 rounded-lg bg-white text-surface-700"
          >
            <option value="all">All Responses</option>
            <option value="yes">Attending</option>
            <option value="no">Not Attending</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>
      </Card>

      {/* Responses Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          {filteredResponses.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-surface-300 mx-auto mb-4" />
              <h3 className="font-medium text-surface-900 mb-2">
                {rsvpResponses.length === 0 ? "No responses yet" : "No matching responses"}
              </h3>
              <p className="text-surface-500">
                {rsvpResponses.length === 0
                  ? "Share your invitation to start collecting RSVPs"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Dietary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
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
                      {rsvp.plusOneName && (
                        <p className="text-sm text-surface-500">+{rsvp.plusOneName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rsvp.dietaryRestrictions ? (
                        <span className="text-sm text-surface-600">{rsvp.dietaryRestrictions}</span>
                      ) : (
                        <span className="text-sm text-surface-400">None</span>
                      )}
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
          )}
        </div>
      </Card>
    </div>
  );
}
