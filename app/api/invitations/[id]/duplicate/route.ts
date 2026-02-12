import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { getInvitationById, createInvitation } from "@/services/aws/dynamodb";
import { nanoid } from "nanoid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the original invitation
    const original = await getInvitationById(id);
    if (!original) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (original.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create new invitation with copied data
    const now = new Date().toISOString();
    const newId = nanoid();
    const newShortId = nanoid(8);

    const duplicatedInvitation = {
      ...original,
      id: newId,
      shortId: newShortId,
      title: `${original.title} (Copy)`,
      status: "draft" as const,
      viewCount: 0,
      shareUrl: "",
      publishedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    // Remove undefined fields
    if (!duplicatedInvitation.publishedAt) {
      delete (duplicatedInvitation as Record<string, unknown>).publishedAt;
    }

    const success = await createInvitation(duplicatedInvitation);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to duplicate invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: duplicatedInvitation,
    });
  } catch (error) {
    console.error("Error duplicating invitation:", error);
    return NextResponse.json(
      { error: "Failed to duplicate invitation" },
      { status: 500 }
    );
  }
}
