import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { getUserById, updateUser } from "@/services/aws/dynamodb";
import type { UserSettings } from "@/types";
import { logAuditEvent } from "@/lib/audit-log";

// GET - Get user settings
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user.settings || getDefaultSettings(),
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get current user to merge settings
    const user = await getUserById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Merge with existing settings
    const currentSettings = user.settings || getDefaultSettings();
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...validateSettings(body),
    };

    const success = await updateUser(auth.userId, {
      settings: updatedSettings,
      updatedAt: new Date().toISOString(),
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    // Log settings update
    logAuditEvent("data.user.settings.updated", {
      userId: auth.userId,
      outcome: "success",
      details: { updatedFields: Object.keys(validateSettings(body)) },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

function getDefaultSettings(): UserSettings {
  return {
    emailNotifications: true,
    rsvpReminders: true,
    marketingEmails: false,
    timezone: "America/New_York",
    language: "en",
  };
}

function validateSettings(input: Partial<UserSettings>): Partial<UserSettings> {
  const validated: Partial<UserSettings> = {};

  if (typeof input.emailNotifications === "boolean") {
    validated.emailNotifications = input.emailNotifications;
  }

  if (typeof input.rsvpReminders === "boolean") {
    validated.rsvpReminders = input.rsvpReminders;
  }

  if (typeof input.marketingEmails === "boolean") {
    validated.marketingEmails = input.marketingEmails;
  }

  if (typeof input.timezone === "string" && input.timezone.length > 0) {
    validated.timezone = input.timezone;
  }

  if (typeof input.language === "string" && input.language.length === 2) {
    validated.language = input.language;
  }

  if (typeof input.defaultTemplate === "string") {
    validated.defaultTemplate = input.defaultTemplate;
  }

  return validated;
}
