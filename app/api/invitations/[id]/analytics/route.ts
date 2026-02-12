import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";
const RSVP_TABLE = process.env.DYNAMODB_RSVPS_TABLE || "InviteGenerator-RSVPs-production";

// GET /api/invitations/[id]/analytics - Get invitation analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get invitation
    const invitationResult = await dynamodb.send(
      new GetItemCommand({
        TableName: INVITATIONS_TABLE,
        Key: marshall({ id }),
      })
    );

    if (!invitationResult.Item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Invitation not found" } },
        { status: 404 }
      );
    }

    const invitation = unmarshall(invitationResult.Item);

    if (invitation.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Get RSVP stats
    const rsvpResult = await dynamodb.send(
      new QueryCommand({
        TableName: RSVP_TABLE,
        IndexName: "invitationId-index",
        KeyConditionExpression: "invitationId = :invitationId",
        ExpressionAttributeValues: marshall({ ":invitationId": id }),
      })
    );

    const rsvps = (rsvpResult.Items || []).map((item) => unmarshall(item));

    // Calculate RSVP stats
    const rsvpStats = {
      total: rsvps.length,
      yes: rsvps.filter((r) => r.response === "yes").length,
      no: rsvps.filter((r) => r.response === "no").length,
      maybe: rsvps.filter((r) => r.response === "maybe").length,
      pending: rsvps.filter((r) => !r.response || r.response === "pending").length,
      totalGuests: rsvps.reduce((sum, r) => sum + (r.guestCount || 1), 0),
    };

    // Calculate daily response trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyResponses: Record<string, number> = {};
    rsvps.forEach((rsvp) => {
      const date = new Date(rsvp.createdAt).toISOString().split("T")[0];
      dailyResponses[date] = (dailyResponses[date] || 0) + 1;
    });

    // Calculate view stats from invitation
    const viewStats = {
      totalViews: invitation.viewCount || 0,
      uniqueViews: invitation.uniqueViewCount || 0,
      lastViewed: invitation.lastViewedAt || null,
    };

    // Response time analysis
    const responseTimes = rsvps
      .filter((r) => r.createdAt)
      .map((r) => {
        const publishDate = new Date(invitation.publishedAt || invitation.createdAt);
        const responseDate = new Date(r.createdAt);
        return (responseDate.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24); // Days
      });

    const avgResponseTime = responseTimes.length
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Guest breakdown by dietary restrictions
    const dietaryBreakdown: Record<string, number> = {};
    rsvps.forEach((rsvp) => {
      if (rsvp.dietaryRestrictions) {
        const restrictions = rsvp.dietaryRestrictions.split(",").map((s: string) => s.trim());
        restrictions.forEach((r: string) => {
          dietaryBreakdown[r] = (dietaryBreakdown[r] || 0) + 1;
        });
      }
    });

    const analytics = {
      invitation: {
        id: invitation.id,
        title: invitation.title,
        status: invitation.status,
        eventDate: invitation.eventDate,
        createdAt: invitation.createdAt,
        publishedAt: invitation.publishedAt,
      },
      views: viewStats,
      rsvp: {
        stats: rsvpStats,
        conversionRate: viewStats.uniqueViews
          ? ((rsvpStats.total / viewStats.uniqueViews) * 100).toFixed(1) + "%"
          : "N/A",
        avgResponseTime: avgResponseTime.toFixed(1) + " days",
        dailyTrend: dailyResponses,
      },
      guests: {
        confirmed: rsvpStats.yes,
        totalExpected: rsvps
          .filter((r) => r.response === "yes")
          .reduce((sum, r) => sum + (r.guestCount || 1), 0),
        dietaryRestrictions: dietaryBreakdown,
      },
      engagement: {
        shareCount: invitation.shareCount || 0,
        qrScans: invitation.qrScanCount || 0,
        emailsSent: invitation.emailsSentCount || 0,
      },
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, error: { code: "ANALYTICS_FAILED", message: "Failed to fetch analytics" } },
      { status: 500 }
    );
  }
}
