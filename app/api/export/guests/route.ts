import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, QueryCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";
const RSVP_TABLE = process.env.DYNAMODB_RSVPS_TABLE || "InviteGenerator-RSVPs-production";

interface RSVPRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  response: string;
  guestCount?: number;
  dietaryRestrictions?: string;
  message?: string;
  respondedAt?: string;
  createdAt: string;
}

// GET /api/export/guests - Export guest list as CSV
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");
    const format = searchParams.get("format") || "csv";
    const responseFilter = searchParams.get("response"); // yes, no, maybe, pending

    if (!invitationId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Invitation ID required" } },
        { status: 400 }
      );
    }

    // Verify invitation ownership
    const invitationResult = await dynamodb.send(
      new GetItemCommand({
        TableName: INVITATIONS_TABLE,
        Key: marshall({ id: invitationId }),
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

    // Get RSVPs
    const rsvpResult = await dynamodb.send(
      new QueryCommand({
        TableName: RSVP_TABLE,
        IndexName: "invitationId-index",
        KeyConditionExpression: "invitationId = :invitationId",
        ExpressionAttributeValues: marshall({ ":invitationId": invitationId }),
      })
    );

    let guests: RSVPRecord[] = (rsvpResult.Items || []).map((item) => unmarshall(item) as RSVPRecord);

    // Apply response filter
    if (responseFilter) {
      guests = guests.filter((g) => g.response === responseFilter);
    }

    // Sort by name
    guests.sort((a, b) => a.name.localeCompare(b.name));

    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: {
          invitationTitle: invitation.title,
          exportedAt: new Date().toISOString(),
          totalGuests: guests.length,
          guests,
        },
      });
    }

    // Generate CSV
    const csvHeaders = [
      "Name",
      "Email",
      "Phone",
      "Response",
      "Guest Count",
      "Dietary Restrictions",
      "Message",
      "Responded At",
    ];

    const csvRows = guests.map((guest) => [
      escapeCsvField(guest.name),
      escapeCsvField(guest.email || ""),
      escapeCsvField(guest.phone || ""),
      escapeCsvField(formatResponse(guest.response)),
      guest.guestCount?.toString() || "1",
      escapeCsvField(guest.dietaryRestrictions || ""),
      escapeCsvField(guest.message || ""),
      guest.respondedAt ? new Date(guest.respondedAt).toLocaleDateString() : "",
    ]);

    const csv = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

    // Return CSV file
    const filename = `guests-${invitation.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export guests error:", error);
    return NextResponse.json(
      { success: false, error: { code: "EXPORT_FAILED", message: "Failed to export guests" } },
      { status: 500 }
    );
  }
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function formatResponse(response: string): string {
  const responseMap: Record<string, string> = {
    yes: "Attending",
    no: "Not Attending",
    maybe: "Maybe",
    pending: "Pending",
  };
  return responseMap[response] || response;
}
