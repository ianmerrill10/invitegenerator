import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { getAuthenticatedUser } from "@/lib/auth";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code: "EXPORT_ERROR", message } },
    { status }
  );
}

// Escape CSV field
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET /api/rsvp/[invitationId]/export - Export RSVPs as CSV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params;
    const authResult = await getAuthenticatedUser();
    if (!authResult.success) {
      return errorResponse(authResult.error.message, 401);
    }
    const userId = authResult.user.userId;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    // Verify user owns invitation
    const getInvitation = new GetCommand({
      TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
      Key: { id: invitationId },
    });

    const invitationResult = await docClient.send(getInvitation);

    if (!invitationResult.Item) {
      return errorResponse("Invitation not found", 404);
    }

    if (invitationResult.Item.userId !== userId) {
      return errorResponse("Forbidden", 403);
    }

    // Get RSVPs
    const queryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_RSVP_TABLE,
      IndexName: "invitationId-index",
      KeyConditionExpression: "invitationId = :invitationId",
      ExpressionAttributeValues: {
        ":invitationId": invitationId,
      },
      ScanIndexForward: false,
    });

    const result = await docClient.send(queryCommand);
    const rsvps = result.Items || [];

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Response",
        "Guest Count",
        "Guest Names",
        "Dietary Restrictions",
        "Message",
        "Submitted At",
      ];

      const rows = rsvps.map((rsvp) => [
        escapeCSV(rsvp.name),
        escapeCSV(rsvp.email),
        escapeCSV(rsvp.phone),
        escapeCSV(rsvp.attending),
        escapeCSV(rsvp.guestCount),
        escapeCSV(rsvp.guestNames?.join("; ")),
        escapeCSV(rsvp.dietaryRestrictions),
        escapeCSV(rsvp.message),
        escapeCSV(new Date(rsvp.createdAt).toLocaleString()),
      ]);

      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="rsvp-${invitationId}.csv"`,
        },
      });
    }

    // Default to JSON
    return NextResponse.json({
      success: true,
      data: rsvps,
    });
  } catch (error) {
    console.error("Export RSVPs error:", error);
    return errorResponse("Failed to export RSVPs", 500);
  }
}
