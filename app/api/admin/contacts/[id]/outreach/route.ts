import { NextRequest, NextResponse } from "next/server";
import { ContactsService } from "@/lib/services/contacts-service";
import { verifyAuth } from "@/lib/auth-server";
import { OutreachType } from "@/types";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || "InviteGenerator-Users-production";

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: USERS_TABLE,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: marshall({ ":id": userId }),
        ProjectionExpression: "#role",
        ExpressionAttributeNames: { "#role": "role" },
      })
    );

    if (result.Items && result.Items.length > 0) {
      const user = unmarshall(result.Items[0]);
      return user.role === "admin";
    }
    return false;
  } catch {
    return false;
  }
}

// POST /api/admin/contacts/[id]/outreach - Add an outreach record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = (await verifyAuth(request)) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Verify admin role
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.subject) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Type and subject are required" } },
        { status: 400 }
      );
    }

    const validTypes: OutreachType[] = ["email", "phone", "dm_instagram", "dm_facebook", "dm_linkedin", "dm_tiktok", "meeting", "conference", "other"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid outreach type" } },
        { status: 400 }
      );
    }

    const contact = await ContactsService.addOutreach(id, {
      type: body.type,
      subject: body.subject,
      notes: body.notes || "",
      outcome: body.outcome || "pending",
      followUpDate: body.followUpDate,
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contact not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Add outreach error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to add outreach record" } },
      { status: 500 }
    );
  }
}
