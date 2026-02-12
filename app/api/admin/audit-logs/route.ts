import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-server";
import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const AUDIT_LOG_TABLE = process.env.DYNAMODB_AUDIT_LOG_TABLE || "InviteGenerator-AuditLog-production";
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

// GET /api/admin/audit-logs - Get audit logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
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
    const eventType = searchParams.get("eventType");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

    let items: Record<string, unknown>[] = [];

    if (eventType) {
      // Query by event type using GSI
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: AUDIT_LOG_TABLE,
          IndexName: "GSI1",
          KeyConditionExpression: startDate
            ? "GSI1PK = :eventType AND GSI1SK BETWEEN :start AND :end"
            : "GSI1PK = :eventType",
          ExpressionAttributeValues: marshall({
            ":eventType": eventType,
            ...(startDate && { ":start": startDate }),
            ...(endDate && { ":end": endDate || "9999-12-31" }),
          }),
          ScanIndexForward: false,
          Limit: limit,
        })
      );
      items = (result.Items || []).map((item) => unmarshall(item));
    } else if (userId) {
      // Query by user ID
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: AUDIT_LOG_TABLE,
          KeyConditionExpression: startDate
            ? "PK = :pk AND SK BETWEEN :start AND :end"
            : "PK = :pk",
          ExpressionAttributeValues: marshall({
            ":pk": `USER#${userId}`,
            ...(startDate && { ":start": startDate }),
            ...(endDate && { ":end": endDate || "9999-12-31" }),
          }),
          ScanIndexForward: false,
          Limit: limit,
        })
      );
      items = (result.Items || []).map((item) => unmarshall(item));
    } else {
      // Scan all (with date filter if provided)
      const result = await dynamodb.send(
        new ScanCommand({
          TableName: AUDIT_LOG_TABLE,
          FilterExpression: startDate
            ? "#timestamp BETWEEN :start AND :end"
            : undefined,
          ExpressionAttributeNames: startDate ? { "#timestamp": "timestamp" } : undefined,
          ExpressionAttributeValues: startDate
            ? marshall({
                ":start": startDate,
                ":end": endDate || new Date().toISOString(),
              })
            : undefined,
          Limit: limit,
        })
      );
      items = (result.Items || []).map((item) => unmarshall(item));
    }

    // Clean up internal fields
    const logs = items.map((item) => {
      const log = { ...item };
      delete log.PK;
      delete log.SK;
      delete log.GSI1PK;
      delete log.GSI1SK;
      return log;
    });

    // Sort by timestamp (newest first)
    logs.sort((a, b) => {
      const timeA = new Date(a.timestamp as string).getTime();
      const timeB = new Date(b.timestamp as string).getTime();
      return timeB - timeA;
    });

    // Calculate summary stats
    const summary = {
      total: logs.length,
      byStatus: {
        success: logs.filter((l) => l.status === "success").length,
        failure: logs.filter((l) => l.status === "failure").length,
        warning: logs.filter((l) => l.status === "warning").length,
      },
      byEventType: logs.reduce<Record<string, number>>(
        (acc, log) => {
          const type = (log.eventType as string) || "unknown";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {}
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        logs,
        summary,
        pagination: {
          count: logs.length,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch audit logs" } },
      { status: 500 }
    );
  }
}
