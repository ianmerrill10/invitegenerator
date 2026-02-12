/**
 * DynamoDB Table Creation Script for Notifications
 *
 * Run: npx tsx scripts/create-notifications-table.ts
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TABLE_NAME = process.env.DYNAMODB_NOTIFICATIONS_TABLE || "InviteGenerator-Notifications-production";

async function tableExists(): Promise<boolean> {
  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch {
    return false;
  }
}

async function createTable() {
  console.log("Creating Notifications DynamoDB Table...");
  console.log(`Table name: ${TABLE_NAME}`);

  if (await tableExists()) {
    console.log("Table already exists, skipping creation.");
    return;
  }

  const command = new CreateTableCommand({
    TableName: TABLE_NAME,
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" },
      { AttributeName: "SK", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" },
      { AttributeName: "SK", AttributeType: "S" },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    // Enable TTL for automatic notification expiration
    // Note: TTL must be enabled separately via UpdateTimeToLive API
  });

  try {
    await dynamodb.send(command);
    console.log("Table created successfully!");
    console.log("\nTable Schema:");
    console.log("  Primary Key: PK (String) - USER#<userId>");
    console.log("  Sort Key: SK (String) - NOTIFICATION#<createdAt>#<id>");
    console.log("\nExpected Fields:");
    console.log("  - id: Unique notification ID");
    console.log("  - userId: User who receives the notification");
    console.log("  - type: Notification type (rsvp_received, payment_received, etc.)");
    console.log("  - title: Notification title");
    console.log("  - message: Notification message");
    console.log("  - link: Optional link to navigate to");
    console.log("  - read: Boolean - has the notification been read");
    console.log("  - createdAt: ISO timestamp");
    console.log("  - expiresAt: Optional expiration timestamp");
    console.log("  - metadata: Additional notification data (JSON)");
    console.log("\nNote: Enable TTL on 'expiresAt' field for automatic cleanup:");
    console.log("  aws dynamodb update-time-to-live \\");
    console.log(`    --table-name ${TABLE_NAME} \\`);
    console.log("    --time-to-live-specification Enabled=true,AttributeName=expiresAt");
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
}

createTable().catch(console.error);

/*
 * AWS CLI alternative:
 *
 * aws dynamodb create-table \
 *   --table-name invitegenerator-notifications \
 *   --attribute-definitions \
 *     AttributeName=PK,AttributeType=S \
 *     AttributeName=SK,AttributeType=S \
 *   --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 *
 * # Enable TTL:
 * aws dynamodb update-time-to-live \
 *   --table-name invitegenerator-notifications \
 *   --time-to-live-specification Enabled=true,AttributeName=expiresAt
 */
