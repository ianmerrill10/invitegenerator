/**
 * DynamoDB Table Creation Script for Affiliate System
 *
 * Run this script to create all necessary DynamoDB tables for the affiliate program.
 *
 * Usage:
 *   npx tsx scripts/create-affiliate-tables.ts
 *
 * Or with AWS CLI (see commands at bottom)
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ResourceInUseException
} from "@aws-sdk/client-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || "invitegenerator";

// Table definitions for the affiliate system
const AFFILIATE_TABLES = [
  {
    TableName: `${TABLE_PREFIX}-affiliates`,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as const },
      { AttributeName: "userId", AttributeType: "S" as const },
      { AttributeName: "affiliateCode", AttributeType: "S" as const },
      { AttributeName: "tier", AttributeType: "S" as const },
      { AttributeName: "status", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "affiliateCode-index",
        KeySchema: [
          { AttributeName: "affiliateCode", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "tier-index",
        KeySchema: [
          { AttributeName: "tier", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "status-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    description: "Stores affiliate profiles with tier, commission settings, and payout info",
  },
  {
    TableName: `${TABLE_PREFIX}-affiliate-referrals`,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as const },
      { AttributeName: "affiliateId", AttributeType: "S" as const },
      { AttributeName: "referredUserId", AttributeType: "S" as const },
      { AttributeName: "status", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "affiliateId-index",
        KeySchema: [
          { AttributeName: "affiliateId", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "referredUserId-index",
        KeySchema: [
          { AttributeName: "referredUserId", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "status-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    description: "Tracks referrals from click to signup to paid conversion",
  },
  {
    TableName: `${TABLE_PREFIX}-affiliate-commissions`,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as const },
      { AttributeName: "affiliateId", AttributeType: "S" as const },
      { AttributeName: "referralId", AttributeType: "S" as const },
      { AttributeName: "status", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "affiliateId-index",
        KeySchema: [
          { AttributeName: "affiliateId", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "referralId-index",
        KeySchema: [
          { AttributeName: "referralId", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "status-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    description: "Tracks commission earnings for each referral payment",
  },
  {
    TableName: `${TABLE_PREFIX}-affiliate-payouts`,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as const },
      { AttributeName: "affiliateId", AttributeType: "S" as const },
      { AttributeName: "status", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "affiliateId-index",
        KeySchema: [
          { AttributeName: "affiliateId", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "status-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    description: "Tracks payout requests and processing status",
  },
  {
    TableName: `${TABLE_PREFIX}-affiliate-applications`,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as const },
      { AttributeName: "email", AttributeType: "S" as const },
      { AttributeName: "status", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [
          { AttributeName: "email", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "status-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    description: "Stores affiliate program applications for approval",
  },
  {
    TableName: `${TABLE_PREFIX}-affiliate-clicks`,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" as const },
      { AttributeName: "affiliateId", AttributeType: "S" as const },
      { AttributeName: "createdAt", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "affiliateId-createdAt-index",
        KeySchema: [
          { AttributeName: "affiliateId", KeyType: "HASH" as const },
          { AttributeName: "createdAt", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    description: "Tracks affiliate link clicks for analytics",
  },
];

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    return false;
  }
}

async function createTable(tableConfig: typeof AFFILIATE_TABLES[0]): Promise<void> {
  const { description, ...tableParams } = tableConfig;

  console.log(`\nCreating table: ${tableParams.TableName}`);
  console.log(`  Description: ${description}`);

  if (await tableExists(tableParams.TableName)) {
    console.log(`  ⏭️  Table already exists, skipping...`);
    return;
  }

  try {
    await dynamodb.send(new CreateTableCommand(tableParams));
    console.log(`  ✅ Table created successfully`);
    console.log(`  📊 Indexes: ${tableParams.GlobalSecondaryIndexes?.map(i => i.IndexName).join(", ")}`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`  ⏭️  Table already exists`);
    } else {
      console.error(`  ❌ Error creating table:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("InviteGenerator Affiliate System - DynamoDB Table Setup");
  console.log("=".repeat(60));
  console.log(`\nTable prefix: ${TABLE_PREFIX}`);
  console.log(`Region: ${process.env.AWS_REGION || "us-east-1"}`);
  console.log(`Tables to create: ${AFFILIATE_TABLES.length}`);

  for (const table of AFFILIATE_TABLES) {
    await createTable(table);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Table creation complete!");
  console.log("=".repeat(60));

  console.log("\n📋 Table Summary:");
  for (const table of AFFILIATE_TABLES) {
    console.log(`  - ${table.TableName}: ${table.description}`);
  }

  console.log("\n💡 Next steps:");
  console.log("  1. Verify tables in AWS Console: https://console.aws.amazon.com/dynamodb");
  console.log("  2. Update .env with table names if using custom prefix");
  console.log("  3. Test affiliate API endpoints");
}

main().catch(console.error);

/*
 * AWS CLI Commands (alternative to running this script):
 *
 * # Create affiliates table
 * aws dynamodb create-table \
 *   --table-name invitegenerator-affiliates \
 *   --attribute-definitions \
 *     AttributeName=id,AttributeType=S \
 *     AttributeName=userId,AttributeType=S \
 *     AttributeName=affiliateCode,AttributeType=S \
 *     AttributeName=tier,AttributeType=S \
 *     AttributeName=status,AttributeType=S \
 *   --key-schema AttributeName=id,KeyType=HASH \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"userId-index\",\"KeySchema\":[{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"affiliateCode-index\",\"KeySchema\":[{\"AttributeName\":\"affiliateCode\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"tier-index\",\"KeySchema\":[{\"AttributeName\":\"tier\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"status-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 *
 * # Create affiliate-referrals table
 * aws dynamodb create-table \
 *   --table-name invitegenerator-affiliate-referrals \
 *   --attribute-definitions \
 *     AttributeName=id,AttributeType=S \
 *     AttributeName=affiliateId,AttributeType=S \
 *     AttributeName=referredUserId,AttributeType=S \
 *     AttributeName=status,AttributeType=S \
 *   --key-schema AttributeName=id,KeyType=HASH \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"affiliateId-index\",\"KeySchema\":[{\"AttributeName\":\"affiliateId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"referredUserId-index\",\"KeySchema\":[{\"AttributeName\":\"referredUserId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"status-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 *
 * # Create affiliate-commissions table
 * aws dynamodb create-table \
 *   --table-name invitegenerator-affiliate-commissions \
 *   --attribute-definitions \
 *     AttributeName=id,AttributeType=S \
 *     AttributeName=affiliateId,AttributeType=S \
 *     AttributeName=referralId,AttributeType=S \
 *     AttributeName=status,AttributeType=S \
 *   --key-schema AttributeName=id,KeyType=HASH \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"affiliateId-index\",\"KeySchema\":[{\"AttributeName\":\"affiliateId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"referralId-index\",\"KeySchema\":[{\"AttributeName\":\"referralId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"status-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 *
 * # Create affiliate-payouts table
 * aws dynamodb create-table \
 *   --table-name invitegenerator-affiliate-payouts \
 *   --attribute-definitions \
 *     AttributeName=id,AttributeType=S \
 *     AttributeName=affiliateId,AttributeType=S \
 *     AttributeName=status,AttributeType=S \
 *   --key-schema AttributeName=id,KeyType=HASH \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"affiliateId-index\",\"KeySchema\":[{\"AttributeName\":\"affiliateId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"status-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 *
 * # Create affiliate-applications table
 * aws dynamodb create-table \
 *   --table-name invitegenerator-affiliate-applications \
 *   --attribute-definitions \
 *     AttributeName=id,AttributeType=S \
 *     AttributeName=email,AttributeType=S \
 *     AttributeName=status,AttributeType=S \
 *   --key-schema AttributeName=id,KeyType=HASH \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"email-index\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}},{\"IndexName\":\"status-index\",\"KeySchema\":[{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 *
 * # Create affiliate-clicks table
 * aws dynamodb create-table \
 *   --table-name invitegenerator-affiliate-clicks \
 *   --attribute-definitions \
 *     AttributeName=id,AttributeType=S \
 *     AttributeName=affiliateId,AttributeType=S \
 *     AttributeName=createdAt,AttributeType=S \
 *   --key-schema AttributeName=id,KeyType=HASH \
 *   --global-secondary-indexes \
 *     "[{\"IndexName\":\"affiliateId-createdAt-index\",\"KeySchema\":[{\"AttributeName\":\"affiliateId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
 *   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
 */
