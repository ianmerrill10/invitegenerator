import { NextRequest, NextResponse } from "next/server";
import { ContactsService } from "@/lib/services/contacts-service";
import { verifyAuth } from "@/lib/auth-server";
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

// GET /api/admin/contacts/[id] - Get a single contact
export async function GET(
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
    const contact = await ContactsService.getContact(id);

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
    console.error("Get contact error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to get contact" } },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contacts/[id] - Update a contact
export async function PUT(
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

    const contact = await ContactsService.updateContact(id, body);

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
    console.error("Update contact error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update contact" } },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contacts/[id] - Delete a contact
export async function DELETE(
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
    await ContactsService.deleteContact(id);

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete contact" } },
      { status: 500 }
    );
  }
}
