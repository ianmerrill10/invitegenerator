import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Cache for stats to avoid hitting DB on every request
let statsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/stats - Get real platform statistics (public endpoint)
export async function GET() {
  try {
    // Check cache first
    if (statsCache && Date.now() - statsCache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: statsCache.data,
        cached: true,
      });
    }

    // Count invitations (only published ones)
    let invitationCount = 0;
    let lastEvaluatedKey: any = undefined;

    do {
      const scanCommand = new ScanCommand({
        TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
        FilterExpression: "#status = :published",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":published": "published",
        },
        Select: "COUNT",
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const result = await docClient.send(scanCommand);
      invitationCount += result.Count || 0;
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // Count users
    let userCount = 0;
    lastEvaluatedKey = undefined;

    do {
      const scanCommand = new ScanCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE,
        Select: "COUNT",
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const result = await docClient.send(scanCommand);
      userCount += result.Count || 0;
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // Count RSVPs
    let rsvpCount = 0;
    lastEvaluatedKey = undefined;

    do {
      const scanCommand = new ScanCommand({
        TableName: process.env.DYNAMODB_RSVPS_TABLE,
        Select: "COUNT",
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const result = await docClient.send(scanCommand);
      rsvpCount += result.Count || 0;
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const stats = {
      invitations: invitationCount,
      users: userCount,
      rsvps: rsvpCount,
      // We don't have a rating system yet, so don't include fake ratings
    };

    // Update cache
    statsCache = {
      data: stats,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
    });
  } catch (error) {
    console.error("Get stats error:", error);

    // Return zeros if database is unavailable
    return NextResponse.json({
      success: true,
      data: {
        invitations: 0,
        users: 0,
        rsvps: 0,
      },
      error: "Stats temporarily unavailable",
    });
  }
}
