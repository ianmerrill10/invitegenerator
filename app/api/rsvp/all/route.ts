import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { getInvitationsByUserId, getRSVPsByInvitationId } from "@/services/aws/dynamodb";
import type { RSVPResponse } from "@/types";

// GET - Get all RSVP responses for all of user's invitations
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all user's invitations
    const invitations = await getInvitationsByUserId(auth.userId);

    // Get RSVPs for each invitation
    const allRsvps: RSVPResponse[] = [];

    for (const invitation of invitations) {
      const rsvps = await getRSVPsByInvitationId(invitation.id);
      allRsvps.push(...rsvps);
    }

    // Sort by submission date (most recent first)
    allRsvps.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    // Calculate summary stats
    const attending = allRsvps.filter(r => r.response === "attending");
    const notAttending = allRsvps.filter(r => r.response === "not_attending");
    const maybe = allRsvps.filter(r => r.response === "maybe");
    const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0);

    return NextResponse.json({
      success: true,
      data: {
        responses: allRsvps,
        summary: {
          total: allRsvps.length,
          attending: attending.length,
          notAttending: notAttending.length,
          maybe: maybe.length,
          totalGuests,
          responseRate: allRsvps.length > 0
            ? Math.round((attending.length / allRsvps.length) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all RSVPs:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}
