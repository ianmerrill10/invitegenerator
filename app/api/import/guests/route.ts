import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, GetItemCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const INVITATIONS_TABLE = process.env.DYNAMODB_INVITATIONS_TABLE || "InviteGenerator-Invitations-production";
const RSVP_TABLE = process.env.DYNAMODB_RSVPS_TABLE || "InviteGenerator-RSVPs-production";

interface ImportedGuest {
  name: string;
  email?: string;
  phone?: string;
  guestCount?: number;
  dietaryRestrictions?: string;
  notes?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

// POST /api/import/guests - Import guests from CSV
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const invitationId = formData.get("invitationId") as string | null;
    const skipDuplicates = formData.get("skipDuplicates") === "true";

    if (!file || !invitationId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "File and invitation ID required" } },
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

    // Parse CSV
    const csvContent = await file.text();
    const { guests, errors } = parseCSV(csvContent);

    if (guests.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "PARSE_ERROR", message: "Failed to parse CSV", details: errors } },
        { status: 400 }
      );
    }

    // Get existing guests to check for duplicates
    const existingEmails = new Set<string>();
    if (skipDuplicates) {
      const { QueryCommand } = await import("@aws-sdk/client-dynamodb");
      const existingResult = await dynamodb.send(
        new QueryCommand({
          TableName: RSVP_TABLE,
          IndexName: "invitationId-index",
          KeyConditionExpression: "invitationId = :invitationId",
          ExpressionAttributeValues: marshall({ ":invitationId": invitationId }),
          ProjectionExpression: "email",
        })
      );

      (existingResult.Items || []).forEach((item) => {
        const guest = unmarshall(item);
        if (guest.email) {
          existingEmails.add(guest.email.toLowerCase());
        }
      });
    }

    // Create guest records
    const now = new Date().toISOString();
    const guestsToImport: Array<{ guest: ImportedGuest; row: number }> = [];
    const skippedRows: number[] = [];

    guests.forEach((guest, index) => {
      const row = index + 2; // Account for header row and 0-index

      if (skipDuplicates && guest.email && existingEmails.has(guest.email.toLowerCase())) {
        skippedRows.push(row);
        return;
      }

      guestsToImport.push({ guest, row });
    });

    // Batch write guests (max 25 per batch)
    const batchSize = 25;
    let importedCount = 0;
    const importErrors: Array<{ row: number; error: string }> = [...errors];

    for (let i = 0; i < guestsToImport.length; i += batchSize) {
      const batch = guestsToImport.slice(i, i + batchSize);

      const writeRequests = batch.map(({ guest }) => ({
        PutRequest: {
          Item: marshall(
            {
              id: uuidv4(),
              invitationId,
              name: guest.name,
              email: guest.email || null,
              phone: guest.phone || null,
              guestCount: guest.guestCount || 1,
              dietaryRestrictions: guest.dietaryRestrictions || null,
              notes: guest.notes || null,
              response: "pending",
              source: "import",
              createdAt: now,
              updatedAt: now,
            },
            { removeUndefinedValues: true }
          ),
        },
      }));

      try {
        await dynamodb.send(
          new BatchWriteItemCommand({
            RequestItems: {
              [RSVP_TABLE]: writeRequests,
            },
          })
        );
        importedCount += batch.length;
      } catch (batchError) {
        console.error("Batch write error:", batchError);
        batch.forEach(({ row }) => {
          importErrors.push({ row, error: "Database write failed" });
        });
      }
    }

    const result: ImportResult = {
      success: importedCount > 0,
      imported: importedCount,
      skipped: skippedRows.length,
      errors: importErrors,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Import guests error:", error);
    return NextResponse.json(
      { success: false, error: { code: "IMPORT_FAILED", message: "Failed to import guests" } },
      { status: 500 }
    );
  }
}

function parseCSV(content: string): { guests: ImportedGuest[]; errors: Array<{ row: number; error: string }> } {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const guests: ImportedGuest[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  if (lines.length === 0) {
    return { guests: [], errors: [{ row: 0, error: "Empty file" }] };
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim());

  // Map headers to field indices
  const nameIndex = headers.findIndex((h) => h === "name" || h === "full name" || h === "guest name");
  const emailIndex = headers.findIndex((h) => h === "email" || h === "email address");
  const phoneIndex = headers.findIndex((h) => h === "phone" || h === "phone number" || h === "mobile");
  const guestCountIndex = headers.findIndex((h) => h === "guest count" || h === "guests" || h === "party size");
  const dietaryIndex = headers.findIndex((h) => h === "dietary" || h === "dietary restrictions" || h === "diet");
  const notesIndex = headers.findIndex((h) => h === "notes" || h === "message" || h === "comments");

  if (nameIndex === -1) {
    return { guests: [], errors: [{ row: 1, error: "Name column not found. Please include a 'Name' column." }] };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = i + 1;
    const line = lines[i].trim();

    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      const name = values[nameIndex]?.trim();

      if (!name) {
        errors.push({ row, error: "Missing name" });
        continue;
      }

      const guest: ImportedGuest = {
        name,
        email: emailIndex >= 0 ? values[emailIndex]?.trim() : undefined,
        phone: phoneIndex >= 0 ? values[phoneIndex]?.trim() : undefined,
        guestCount: guestCountIndex >= 0 ? parseInt(values[guestCountIndex]) || 1 : 1,
        dietaryRestrictions: dietaryIndex >= 0 ? values[dietaryIndex]?.trim() : undefined,
        notes: notesIndex >= 0 ? values[notesIndex]?.trim() : undefined,
      };

      // Validate email format
      if (guest.email && !isValidEmail(guest.email)) {
        errors.push({ row, error: `Invalid email format: ${guest.email}` });
        guest.email = undefined;
      }

      guests.push(guest);
    } catch (parseError) {
      errors.push({ row, error: "Failed to parse row" });
    }
  }

  return { guests, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
