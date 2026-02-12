import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { NotificationService } from "@/lib/services/notification-service";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const notifications = await NotificationService.getNotifications(auth.userId);
    return NextResponse.json({ success: true, data: { notifications: notifications || [] } });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch notifications" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, notificationId, notificationIds } = body;

    if (action === "mark-read" && notificationId) {
      const result = await NotificationService.markAsRead(auth.userId, notificationId);
      return NextResponse.json({ success: result, data: { marked: result } });
    }

    if (action === "mark-all-read") {
      let idsToMark = notificationIds;

      // If no IDs provided, fetch all unread notifications for the user
      if (!idsToMark || !Array.isArray(idsToMark)) {
         const notifications = await NotificationService.getNotifications(auth.userId);
         idsToMark = notifications.filter(n => !n.read).map(n => n.id);
      }

      const result = await NotificationService.markAllAsRead(auth.userId, idsToMark);
      return NextResponse.json({ success: result, data: { marked: result } });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_ACTION", message: "Invalid action" } },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error processing notification request:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
