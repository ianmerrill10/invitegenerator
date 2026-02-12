"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Mail,
  Trash2,
  Edit,
  Check,
  X,
  HelpCircle,
  UserPlus,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export interface Guest {
  id: string;
  name: string;
  email: string;
  response: "attending" | "not_attending" | "maybe" | "pending";
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
  invitedAt?: Date;
  respondedAt?: Date;
}

interface GuestTableProps {
  guests: Guest[];
  onEdit?: (guest: Guest) => void;
  onDelete?: (guestId: string) => void;
  onResendInvite?: (guestId: string) => void;
  onBulkDelete?: (guestIds: string[]) => void;
  onBulkResend?: (guestIds: string[]) => void;
  onAddGuest?: () => void;
  onExport?: () => void;
  className?: string;
}

const responseConfig = {
  attending: { label: "Attending", icon: Check, variant: "success" as const },
  not_attending: { label: "Not Attending", icon: X, variant: "error" as const },
  maybe: { label: "Maybe", icon: HelpCircle, variant: "warning" as const },
  pending: { label: "Pending", icon: Mail, variant: "secondary" as const },
};

type SortField = "name" | "email" | "response" | "guestCount";
type SortDirection = "asc" | "desc";

export function GuestTable({
  guests,
  onEdit,
  onDelete,
  onResendInvite,
  onBulkDelete,
  onBulkResend,
  onAddGuest,
  onExport,
  className,
}: GuestTableProps) {
  const [search, setSearch] = useState("");
  const [filterResponse, setFilterResponse] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter and sort guests
  const filteredGuests = guests
    .filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(search.toLowerCase()) ||
        guest.email.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filterResponse === "all" || guest.response === filterResponse;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "response":
          comparison = a.response.localeCompare(b.response);
          break;
        case "guestCount":
          comparison = a.guestCount - b.guestCount;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map((g) => g.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Count by status
  const statusCounts = guests.reduce(
    (acc, guest) => {
      acc[guest.response] = (acc[guest.response] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search guests"
            />
          </div>
          <Select value={filterResponse} onValueChange={setFilterResponse}>
            <SelectTrigger className="w-40" aria-label="Filter by response status">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({guests.length})</SelectItem>
              <SelectItem value="attending">
                Attending ({statusCounts.attending || 0})
              </SelectItem>
              <SelectItem value="not_attending">
                Not Attending ({statusCounts.not_attending || 0})
              </SelectItem>
              <SelectItem value="maybe">
                Maybe ({statusCounts.maybe || 0})
              </SelectItem>
              <SelectItem value="pending">
                Pending ({statusCounts.pending || 0})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <>
              {onBulkResend && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkResend(Array.from(selectedIds))}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Resend ({selectedIds.size})
                </Button>
              )}
              {onBulkDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onBulkDelete(Array.from(selectedIds))}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedIds.size})
                </Button>
              )}
            </>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {onAddGuest && (
            <Button size="sm" onClick={onAddGuest}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-50 dark:bg-surface-900">
            <tr>
              <th className="w-10 px-3 py-3">
                <Checkbox
                  checked={
                    filteredGuests.length > 0 &&
                    selectedIds.size === filteredGuests.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="text-left px-3 py-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium"
                  onClick={() => handleSort("name")}
                >
                  Name <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left px-3 py-3 hidden md:table-cell">
                <button
                  className="flex items-center gap-1 text-sm font-medium"
                  onClick={() => handleSort("email")}
                >
                  Email <SortIcon field="email" />
                </button>
              </th>
              <th className="text-left px-3 py-3">
                <button
                  className="flex items-center gap-1 text-sm font-medium"
                  onClick={() => handleSort("response")}
                >
                  Status <SortIcon field="response" />
                </button>
              </th>
              <th className="text-center px-3 py-3 hidden sm:table-cell">
                <button
                  className="flex items-center gap-1 text-sm font-medium"
                  onClick={() => handleSort("guestCount")}
                >
                  Guests <SortIcon field="guestCount" />
                </button>
              </th>
              <th className="w-10 px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {search || filterResponse !== "all"
                    ? "No guests match your search"
                    : "No guests yet"}
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => {
                const config = responseConfig[guest.response];
                const Icon = config.icon;
                return (
                  <tr
                    key={guest.id}
                    className="border-t hover:bg-surface-50 dark:hover:bg-surface-900/50"
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selectedIds.has(guest.id)}
                        onCheckedChange={() => toggleSelect(guest.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-sm text-muted-foreground md:hidden">
                          {guest.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell text-sm">
                      {guest.email}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={config.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      {guest.guestCount}
                    </td>
                    <td className="px-3 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Guest actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(guest)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onResendInvite && guest.response === "pending" && (
                            <DropdownMenuItem
                              onClick={() => onResendInvite(guest.id)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(guest.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {filteredGuests.length} of {guests.length} guests
        </span>
        <span>
          Total attending:{" "}
          {guests
            .filter((g) => g.response === "attending")
            .reduce((sum, g) => sum + g.guestCount, 0)}
        </span>
      </div>
    </div>
  );
}
