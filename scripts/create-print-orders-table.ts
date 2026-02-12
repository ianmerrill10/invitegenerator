/**
 * DynamoDB Table Creation Script for Print Orders
 *
 * Run: npx tsx scripts/create-print-orders-table.ts
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TABLE_NAME = process.env.DYNAMODB_PRINT_ORDERS_TABLE || "InviteGenerator-PrintOrders-production";

async function tableExists(): Promise<boolean> {
  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch {
    return false;
  }
}

async function createTable() {
  console.log("Creating Print Orders DynamoDB Table...");
  console.log(`Table name: ${TABLE_NAME}`);

  if (await tableExists()) {
    console.log("Table already exists, skipping creation.");
    return;
  }

  const command = new CreateTableCommand({
    TableName: TABLE_NAME,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "invitationId", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "invitationId-index",
        KeySchema: [{ AttributeName: "invitationId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
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
    console.log("  Primary Key: id (String)");
    console.log("  GSI: userId-index (userId + createdAt)");
    console.log("  GSI: invitationId-index (invitationId)");
    console.log("  GSI: status-index (status)");
    console.log("\nExpected Fields:");
    console.log("  - id: Order UUID");
    console.log("  - userId: User who placed the order");
    console.log("  - invitationId: Related invitation");
    console.log("  - status: pending_payment, processing, printing, shipped, delivered, cancelled");
    console.log("  - stripeSessionId: Stripe checkout session");
    console.log("  - prodigiOrderId: Prodigi order reference");
    console.log("  - product: { sku, size, cardType, finish, quantity, unitPrice }");
    console.log("  - shipping: { method, address, cost }");
    console.log("  - pricing: { subtotal, shipping, tax, total, currency }");
    console.log("  - trackingNumber, trackingUrl");
    console.log("  - createdAt, updatedAt");
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
 *   --table-name invitegenerator-print-orders \
 *   --attribute-definitions \
 *     AttributeName=id,AttributeType=S \
 *     AttributeName=userId,AttributeType=S \
 *     AttributeName=invitationId,AttributeType=S \
 *     AttributeName=status,AttributeType=S \
 *     AttributeName=createdAt,AttributeType=S \
 *   --key-schema AttributeName=id,KeyType=HASH \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"userId-index\",\"KeySchema\":[{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"invitationId-index\",\"KeySchema\":[{\"AttributeName\":\"invitationId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"status-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 */
