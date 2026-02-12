/**
 * DynamoDB Table Creation Script for Audit Logs
 *
 * Run: npx tsx scripts/create-audit-log-table.ts
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TABLE_NAME = process.env.DYNAMODB_AUDIT_LOG_TABLE || "InviteGenerator-AuditLog-production";

async function tableExists(): Promise<boolean> {
  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch {
    return false;
  }
}

async function createTable() {
  console.log("Creating Audit Log DynamoDB Table...");
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
      { AttributeName: "GSI1PK", AttributeType: "S" },
      { AttributeName: "GSI1SK", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  try {
    await dynamodb.send(command);
    console.log("Table created successfully!");
    console.log("\nTable Schema:");
    console.log("  Primary Key: PK (String) - USER#<userId> or SYSTEM");
    console.log("  Sort Key: SK (String) - <timestamp>#<id>");
    console.log("  GSI1: eventType index");
    console.log("    GSI1PK: Event type (e.g., auth.login)");
    console.log("    GSI1SK: Timestamp");
    console.log("\nExpected Fields:");
    console.log("  - id: Unique log entry ID");
    console.log("  - timestamp: ISO timestamp");
    console.log("  - eventType: Type of event (auth.login, user.created, etc.)");
    console.log("  - userId: User who triggered the event");
    console.log("  - actorId: Admin who performed action (for admin actions)");
    console.log("  - resourceType: Type of resource affected");
    console.log("  - resourceId: ID of affected resource");
    console.log("  - action: Description of the action");
    console.log("  - details: Additional event details (JSON)");
    console.log("  - ipAddress: Client IP address");
    console.log("  - userAgent: Client user agent");
    console.log("  - status: success, failure, or warning");
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
 *   --table-name invitegenerator-audit-logs \
 *   --attribute-definitions \
 *     AttributeName=PK,AttributeType=S \
 *     AttributeName=SK,AttributeType=S \
 *     AttributeName=GSI1PK,AttributeType=S \
 *     AttributeName=GSI1SK,AttributeType=S \
 *   --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"GSI1\",\"KeySchema\":[{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 */
