import { NextRequest, NextResponse } from "next/server";
import { ContactsService } from "@/lib/services/contacts-service";
import { verifyAuth } from "@/lib/auth-server";
import { ContactsFilter, VendorCategory, ContactStatus, PartnershipStatus, ContactSource } from "@/types";
import { CRM_DEFAULTS } from "@/lib/constants";
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

// GET /api/admin/contacts - List all contacts with optional filtering
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const filter: ContactsFilter = {};

    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const partnershipStatus = searchParams.get("partnershipStatus");
    const source = searchParams.get("source");
    const search = searchParams.get("search");

    if (category) filter.category = category as VendorCategory;
    if (status) filter.status = status as ContactStatus;
    if (partnershipStatus) filter.partnershipStatus = partnershipStatus as PartnershipStatus;
    if (source) filter.source = source as ContactSource;
    if (search) filter.search = search;

    const contacts = await ContactsService.listContacts(Object.keys(filter).length > 0 ? filter : undefined);

    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("List contacts error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to list contacts" } },
      { status: 500 }
    );
  }
}

// POST /api/admin/contacts - Create a new contact
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.company || !body.contactName || !body.email || !body.category) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 }
      );
    }

    const contact = await ContactsService.createContact({
      company: body.company,
      contactName: body.contactName,
      title: body.title,
      email: body.email,
      phone: body.phone,
      website: body.website,
      instagram: body.instagram,
      facebook: body.facebook,
      linkedin: body.linkedin,
      tiktok: body.tiktok,
      category: body.category,
      subcategory: body.subcategory,
      location: body.location || { country: CRM_DEFAULTS.country },
      source: body.source || CRM_DEFAULTS.source,
      status: body.status || CRM_DEFAULTS.status,
      tags: body.tags || [],
      notes: body.notes || "",
      outreachHistory: [],
      partnershipStatus: body.partnershipStatus || CRM_DEFAULTS.partnershipStatus,
    });

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create contact" } },
      { status: 500 }
    );
  }
}
