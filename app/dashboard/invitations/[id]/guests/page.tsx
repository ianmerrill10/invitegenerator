"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout";
import { GuestTable, GuestForm, GuestImport, type Guest } from "@/components/guests";
import { notify } from "@/components/notifications";
import { UserPlus, Upload } from "lucide-react";

export default function GuestsManagementPage() {
  const params = useParams();
  useRouter(); // Navigation available for future use
  const invitationId = params.id as string;

  const [invitation, setInvitation] = useState<{ title: string; shortId: string } | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch invitation details
      const invResponse = await fetch(`/api/invitations/${invitationId}`);
      if (!invResponse.ok) {
        if (invResponse.status === 404) {
          setError("Invitation not found");
          return;
        }
        throw new Error("Failed to fetch invitation");
      }
      const invData = await invResponse.json();
      setInvitation({ title: invData.title, shortId: invData.shortId });

      // Fetch guests
      const guestsResponse = await fetch(`/api/invitations/${invitationId}/guests`);
      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        setGuests(guestsData.guests || []);
      } else {
        // If no guests endpoint, use RSVPs as fallback
        const rsvpResponse = await fetch(`/api/rsvp/${invitationId}`);
        if (rsvpResponse.ok) {
          const rsvpData = await rsvpResponse.json();
          // Transform RSVPs to Guest format
          const transformedGuests: Guest[] = (rsvpData.rsvps || []).map((rsvp: {
            id: string;
            name: string;
            email: string;
            attending: "yes" | "no" | "maybe";
            guestCount: number;
            dietaryRestrictions?: string;
            message?: string;
            createdAt: string;
            updatedAt: string;
          }) => ({
            id: rsvp.id,
            name: rsvp.name,
            email: rsvp.email,
            response: rsvp.attending === "yes" ? "attending" : rsvp.attending === "no" ? "not_attending" : rsvp.attending === "maybe" ? "maybe" : "pending",
            guestCount: rsvp.guestCount || 1,
            dietaryRestrictions: rsvp.dietaryRestrictions,
            message: rsvp.message,
            invitedAt: rsvp.createdAt ? new Date(rsvp.createdAt) : undefined,
            respondedAt: rsvp.updatedAt ? new Date(rsvp.updatedAt) : undefined,
          }));
          setGuests(transformedGuests);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddGuest = async (data: {
    name: string;
    email: string;
    response: "attending" | "not_attending" | "maybe" | "pending";
    guestCount: number;
    dietaryRestrictions?: string;
    message?: string;
  }) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add guest");

      notify.success("Guest added", `${data.name} has been added to the guest list`);
      setShowAddGuest(false);
      await fetchData();
    } catch (err) {
      notify.error("Failed to add guest", err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const handleEditGuest = async (data: {
    name: string;
    email: string;
    response: "attending" | "not_attending" | "maybe" | "pending";
    guestCount: number;
    dietaryRestrictions?: string;
    message?: string;
  }) => {
    if (!editingGuest) return;

    try {
      const response = await fetch(`/api/invitations/${invitationId}/guests/${editingGuest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update guest");

      notify.success("Guest updated", `${data.name}'s information has been updated`);
      setEditingGuest(null);
      await fetchData();
    } catch (err) {
      notify.error("Failed to update guest", err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to remove this guest?")) return;

    try {
      const response = await fetch(`/api/invitations/${invitationId}/guests/${guestId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove guest");

      notify.success("Guest removed", "The guest has been removed from the list");
      await fetchData();
    } catch (err) {
      notify.error("Failed to remove guest", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleBulkDelete = async (guestIds: string[]) => {
    if (!confirm(`Are you sure you want to remove ${guestIds.length} guests?`)) return;

    try {
      await Promise.all(
        guestIds.map((id) =>
          fetch(`/api/invitations/${invitationId}/guests/${id}`, { method: "DELETE" })
        )
      );

      notify.success("Guests removed", `${guestIds.length} guests have been removed`);
      await fetchData();
    } catch (err) {
      notify.error("Failed to remove guests", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleResendInvite = async (guestId: string) => {
    try {
      const guest = guests.find((g) => g.id === guestId);
      if (!guest) return;

      const response = await fetch(`/api/invitations/${invitationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [guest.email] }),
      });

      if (!response.ok) throw new Error("Failed to send invite");

      notify.success("Invite sent", `Invitation sent to ${guest.email}`);
    } catch (err) {
      notify.error("Failed to send invite", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleBulkResend = async (guestIds: string[]) => {
    try {
      const emails = guests
        .filter((g) => guestIds.includes(g.id))
        .map((g) => g.email);

      const response = await fetch(`/api/invitations/${invitationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (!response.ok) throw new Error("Failed to send invites");

      notify.success("Invites sent", `${emails.length} invitations have been sent`);
    } catch (err) {
      notify.error("Failed to send invites", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleImport = async (importedGuests: { name: string; email: string }[]) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/guests/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: importedGuests }),
      });

      if (!response.ok) throw new Error("Failed to import guests");

      notify.success("Guests imported", `${importedGuests.length} guests have been imported`);
      setShowImport(false);
      await fetchData();
    } catch (err) {
      notify.error("Failed to import guests", err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const handleExport = () => {
    const csv = [
      "Name,Email,Status,Guest Count,Dietary Restrictions,Message",
      ...guests.map((g) =>
        [
          `"${g.name}"`,
          g.email,
          g.response,
          g.guestCount,
          `"${g.dietaryRestrictions || ""}"`,
          `"${g.message || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guests-${invitation?.shortId || invitationId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading guests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md text-center p-8">
          <h2 className="text-xl font-semibold mb-2">{error}</h2>
          <Link href="/dashboard/invitations">
            <Button variant="outline">Back to Invitations</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Management"
        description={`Manage guests for ${invitation?.title}`}
        breadcrumbs={[
          { label: "Invitations", href: "/dashboard/invitations" },
          { label: invitation?.title || "...", href: `/dashboard/invitations/${invitationId}` },
          { label: "Guests" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowAddGuest(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </div>
        }
      />

      <GuestTable
        guests={guests}
        onEdit={(guest) => setEditingGuest(guest)}
        onDelete={handleDeleteGuest}
        onResendInvite={handleResendInvite}
        onBulkDelete={handleBulkDelete}
        onBulkResend={handleBulkResend}
        onAddGuest={() => setShowAddGuest(true)}
        onExport={handleExport}
      />

      {/* Add Guest Dialog */}
      <GuestForm
        open={showAddGuest}
        onOpenChange={setShowAddGuest}
        onSubmit={handleAddGuest}
      />

      {/* Edit Guest Dialog */}
      <GuestForm
        guest={editingGuest}
        open={!!editingGuest}
        onOpenChange={(open) => !open && setEditingGuest(null)}
        onSubmit={handleEditGuest}
      />

      {/* Import Dialog */}
      <GuestImport
        open={showImport}
        onOpenChange={setShowImport}
        onImport={handleImport}
      />
    </div>
  );
}
