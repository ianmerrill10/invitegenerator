import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { getUserById, updateUser } from "@/services/aws/dynamodb";
import { validateAvatarURL, sanitizeText } from "@/lib/security";
import { logAuditEvent } from "@/lib/audit-log";

// GET - Get user profile
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

    // Return user profile without sensitive data
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        creditsRemaining: user.creditsRemaining,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatarUrl } = body;

    // Validate input
    if (!name && !avatarUrl) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Build updates object
    const updates: Record<string, string> = {
      updatedAt: new Date().toISOString(),
    };

    if (name) {
      if (typeof name !== "string" || name.length < 1 || name.length > 100) {
        return NextResponse.json(
          { error: "Name must be between 1 and 100 characters" },
          { status: 400 }
        );
      }
      // Sanitize name to prevent XSS
      updates.name = sanitizeText(name, 100);
    }

    if (avatarUrl) {
      // Validate avatar URL to prevent SSRF attacks
      const urlValidation = validateAvatarURL(avatarUrl);
      if (!urlValidation.valid) {
        return NextResponse.json(
          { error: urlValidation.error || "Invalid avatar URL" },
          { status: 400 }
        );
      }
      updates.avatarUrl = urlValidation.sanitizedUrl || avatarUrl;
    }

    const success = await updateUser(auth.userId, updates);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Get updated user
    const user = await getUserById(auth.userId);

    // Log profile update
    logAuditEvent("data.user.profile.updated", {
      userId: auth.userId,
      outcome: "success",
      details: { updatedFields: Object.keys(updates).filter(k => k !== "updatedAt") },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        avatarUrl: user?.avatarUrl,
        plan: user?.plan,
        creditsRemaining: user?.creditsRemaining,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
